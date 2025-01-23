import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDateNotBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateNotBeforeToday',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Установить время на начало дня
          const dateValue = new Date(value);
          return dateValue >= today; // Проверка, что дата не раньше сегодняшнего дня
        },
        defaultMessage() {
          return `Дата не может быть раньше сегодняшнего дня.`;
        },
      },
    });
  };
}
