import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  businessType: string; // BusinessType enum как строка

  @IsOptional()
  description?: string;

  @IsOptional()
  businessTerm?: string; // Термин/срок работы

  @IsOptional()
  city?: string; // Город

  @IsOptional()
  street?: string; // Улица

  @IsOptional()
  workTime?: string; // Режим работы

  @IsOptional()
  holidays?: string; // Не рабочие/праздничные дни

  @IsOptional()
  descriptionAI?: string; // AI-описание

  @IsOptional()
  logo?: string; // URL логотипа

  @IsOptional()
  calendar?: string; // Данные календаря (например, JSON)

  @IsOptional()
  analytics?: string; // Данные аналитики

  @IsOptional()
  telegram?: string; // Телеграм-аккаунт

  @IsOptional()
  aiText?: string; // Текст, сгенерированный ИИ

  @IsOptional()
  socials?: string; // Ссылки на социальные сети

  @IsOptional()
  delivery?: string; // Данные о доставке
}

export class UpdateCompanyDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  businessTerm?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  street?: string;

  @IsOptional()
  workTime?: string;

  @IsOptional()
  holidays?: string;

  @IsOptional()
  descriptionAI?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  calendar?: string;

  @IsOptional()
  analytics?: string;

  @IsOptional()
  telegram?: string;

  @IsOptional()
  aiText?: string;

  @IsOptional()
  socials?: string;

  @IsOptional()
  delivery?: string;
}

export class AddStaffDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  role: string; // "STAFF" или "ADMIN"
}
