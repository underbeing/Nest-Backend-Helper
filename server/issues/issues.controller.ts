import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  create(@Req() req: any, @Body() createIssueDto: CreateIssueDto) {
    return this.issuesService.create(createIssueDto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.issuesService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.issuesService.findOne(+id, req.user.organizationId);
  }

  @Patch(':id')
  @UseGuards(new RolesGuard('ADMIN'))
  update(@Req() req: any, @Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.issuesService.update(+id, updateIssueDto, req.user);
  }

  @Delete(':id')
  @UseGuards(new RolesGuard('ADMIN'))
  @HttpCode(204)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.issuesService.remove(+id, req.user);
  }
}
