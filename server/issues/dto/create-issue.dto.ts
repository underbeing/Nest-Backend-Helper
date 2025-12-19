import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
