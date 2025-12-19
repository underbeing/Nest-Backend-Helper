import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateIssueDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['OPEN', 'IN_PROGRESS', 'DONE'])
  @IsOptional()
  status?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}
