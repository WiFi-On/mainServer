interface TimeInfo {
  start: number; // Время начала в виде timestamp
  finish: number; // Время завершения в виде timestamp
  duration: number; // Общая продолжительность выполнения
  processing: number; // Время, потраченное на обработку
  date_start: string; // Время начала в формате ISO
  date_finish: string; // Время завершения в формате ISO
  operating_reset_at: number; // Время сброса операционной системы
  operating: number; // Время работы операционной системы
}

export interface BitrixReturnData {
  result: number; // id
  time: TimeInfo; // Информация о времени выполнения
}
