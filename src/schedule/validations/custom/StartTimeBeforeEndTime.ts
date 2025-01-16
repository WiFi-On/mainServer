import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStartTimeBeforeEndTime(startTimeProperty: string, endTimeProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStartTimeBeforeEndTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [startTimeProperty, endTimeProperty],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [startTimePropertyName, endTimePropertyName] = args.constraints;
          const startTime = args.object[startTimePropertyName];
          const endTime = args.object[endTimePropertyName];

          if (!startTime || !endTime) return true; // Проверка пропускается, если данные отсутствуют

          // Сравнение времени
          return new Date(`1970-01-01T${startTime}:00`) < new Date(`1970-01-01T${endTime}:00`);
        },
        defaultMessage(args: ValidationArguments) {
          const [startTimePropertyName, endTimePropertyName] = args.constraints;
          return `${startTimePropertyName} должно быть меньше ${endTimePropertyName}`;
        },
      },
    });
  };
}
