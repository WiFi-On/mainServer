import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EissdService } from 'src/eissd/eissd.service';
import { Cron } from '@nestjs/schedule';
import { BitrixStatuses } from 'src/bitrix/interfaces/BitrixStatuses.interface';
import { BitrixService } from 'src/bitrix/bitrix.service';
@Injectable()
export class SchedulerService {
  private readonly enviroment: string;
  private readonly logger = new Logger(SchedulerService.name);
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly eissdService: EissdService,
    private readonly bitrixService: BitrixService,
  ) {
    this.enviroment = this.configService.get<string>('ENV');
  }

  async onModuleInit(): Promise<void> {
    if (this.enviroment === 'prod') {
      await this.creatingApplications();
      await this.editStatusApplication();
    }
  }

  /**
   * Функция, которая запускается каждые 2 минуты для заведения заявок из колоник в bitrix.
   * Если что это взаимодействие с api, которое доступно только внутри сайта eissd.
   * Пришлоль брать ручки от туда и с ними творить чудеса, из за того что открытое апи для взаимодействия работает через жопу. И поддержка нулевая.
   * Если придется что то улучшать, нужно будет заходить на сайт и через браузер взять нужные ручки.
   * @returns {Promise<void>}
   */
  @Cron('*/2 * * * *')
  async creatingApplications(): Promise<void> {
    if (this.enviroment === 'prod') {
      // Получаем заявки по ростелекому из битрикса
      const leadsBitrixRtk = await this.bitrixService.getDeals(BitrixStatuses.toSent, 52);
      this.logger.log(`Получены заявки по ростелекому из битрикса для автозаведения. Количество заявок: ${leadsBitrixRtk.length}`, {
        context: 'scheduler/creatingApplications',
        resultCount: leadsBitrixRtk.length,
      });
      for (const lead of leadsBitrixRtk) {
        try {
          // Проверяем техническую возможность
          const thv = await this.eissdService.checkTHV(lead.address);
          // Если техническая возможность есть, то заводим.
          if (thv.result.thv) {
            // Создаем заявку и отправляем в eissd
            const application = await this.eissdService.formingApplication(lead.number, lead.fio, thv);
            // Если при создании заявки что то пошло не так, то возвращаем ошибку в битрикс в комментарии.
            if (application.err) {
              this.logger.error(`Заявка не заведена. Адрес: ${lead.address}. Причина: ${application.result}`, {
                address: lead.address,
                path: 'scheduler/creatingApplications',
                result: application.result,
              });
              this.bitrixService.editApplication(lead.id, application.result, undefined, BitrixStatuses.toError);
              continue;
            }
            // Если заявка заведена, то отправляем в битрикс
            else if (!application.err && application.result.includes('Заявка назначена')) {
              this.logger.log('Заявка назначена', { address: lead.address, path: 'scheduler/creatingApplications', result: application.result });
              this.bitrixService.editApplication(lead.id, application.result, application.idApplication, BitrixStatuses.toAppointed);
            }
          }
          // если нет технических возможности, то отправляем в битрикс с комментрарием проверить техническую возможность
          else {
            this.logger.error(`Нужно проверить тхв вручную. Адрес: ${lead.address}`, {
              address: lead.address,
              path: 'scheduler/creatingApplications',
              result: thv.result.thv,
            });
            this.bitrixService.editApplication(lead.id, 'Нужно проверить тхв вручную', undefined, BitrixStatuses.toError);
          }
        } catch (error) {
          this.logger.error(`Ошибка при создании заявки. Адрес: ${lead.address}. Причина: ${error.message}`, {
            address: lead.address,
            path: 'scheduler/creatingApplications',
            result: error.message,
          });
          this.bitrixService.editApplication(lead.id, error.message, undefined, BitrixStatuses.toError);
        }
      }
    }
  }
  /**
   * Функция, котороя берет все заявки от Ростелекома и со статусом "Заявка отправлена".
   * Проверяет статус заявки через EISSD и в зависимости от статуса заявки меняет статус в битриксе.
   * @returns {Promise<void>}
   */
  @Cron('0 */4 * * *')
  async editStatusApplication(): Promise<void> {
    if (this.enviroment === 'prod') {
      const leadsBitrixRtk = await this.bitrixService.getDeals(BitrixStatuses.toAppointed, 52);
      this.logger.log(`Получены заявки по ростелекому из битрикса для изменения статуса. Количество заявок: ${leadsBitrixRtk.length}`, {
        resultCount: leadsBitrixRtk.length,
      });
      for (const lead of leadsBitrixRtk) {
        try {
          const statusApplication = await this.eissdService.getStatusesApplication(lead.application_id);
          const serviceInternet = statusApplication.find((service) => service.serviceId === '1');
          if (!serviceInternet.statusReasonId && serviceInternet.statusId === '37') {
            this.logger.log(`Назначены дата и время инсталляции. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
            continue;
          } else if (!serviceInternet.statusReasonId && serviceInternet.statusId === '7') {
            const commentBitrix = 'Статус: ' + serviceInternet.statusName + '\n' + 'Дополнительный статус: ' + serviceInternet.statusReasonName;
            this.bitrixService.editApplication(lead.id, commentBitrix, lead.application_id, BitrixStatuses.toConnected);
            this.logger.log(`Клиент подключен. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
          } else if (serviceInternet.bitrixStatus == 'Заявка назначена') {
            this.logger.log(`Заявка назначена. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
            continue;
          } else if (serviceInternet.bitrixStatus == 'Отработка заявок') {
            const commentBitrix = 'Статус: ' + serviceInternet.statusName + '\n' + 'Дополнительный статус: ' + serviceInternet.statusReasonName;
            this.bitrixService.editApplication(lead.id, commentBitrix, lead.application_id, BitrixStatuses.toWorkingOff);
            this.logger.log(`На отработку. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
          } else if (serviceInternet.bitrixStatus == 'Отказ') {
            const commentBitrix = 'Статус: ' + serviceInternet.statusName + '\n' + 'Дополнительный статус: ' + serviceInternet.statusReasonName;
            this.bitrixService.editApplication(lead.id, commentBitrix, lead.application_id, BitrixStatuses.toRefusal);
            this.logger.log(`Отказ. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
          } else if (serviceInternet.bitrixStatus == 'Клиент подключен') {
            const commentBitrix = 'Статус: ' + serviceInternet.statusName + '\n' + 'Дополнительный статус: ' + serviceInternet.statusReasonName;
            this.bitrixService.editApplication(lead.id, commentBitrix, lead.application_id, BitrixStatuses.toConnected);
            this.logger.log(`Клиент подключен. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
          } else {
            this.logger.error(`Ошибка в изменении статуса заявки в битрикс. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
              idBitrix: lead.id,
              idApplication: lead.application_id,
              serviceInternet: serviceInternet,
            });
          }
        } catch (error) {
          this.logger.error(`Ошибка в изменении статуса заявки в битрикс. Айди битрикс: ${lead.id}. Айди заявки: ${lead.application_id}.`, {
            idBitrix: lead.id,
            idApplication: lead.application_id,
            error: error,
          });
        }
      }
    }
  }
}
