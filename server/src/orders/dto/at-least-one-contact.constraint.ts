import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneContact', async: false })
export class AtLeastOneContactConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const object = args.object as { email?: string; phone?: string };
    return Boolean(object.email || object.phone);
  }

  defaultMessage(): string {
    return 'Provide a phone number or an email';
  }
}
