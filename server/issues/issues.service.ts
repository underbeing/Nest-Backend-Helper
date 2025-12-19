import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { db } from '../db';
import { issues, activityLogs } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class IssuesService {
  async create(createIssueDto: CreateIssueDto, user: any) {
    const { organizationId, userId } = user;
    
    // Create Issue
    const [issue] = await db.insert(issues).values({
      ...createIssueDto,
      organizationId,
      status: 'OPEN', // Default
      priority: createIssueDto.priority || 'MEDIUM',
    }).returning();

    // Log Activity
    await this.logActivity(issue.id, 'CREATE', null, 'CREATED', user);

    return issue;
  }

  async findAll(organizationId: string) {
    return db.select()
      .from(issues)
      .where(eq(issues.organizationId, organizationId))
      .orderBy(desc(issues.createdAt));
  }

  async findOne(id: number, organizationId: string) {
    const [issue] = await db.select()
      .from(issues)
      .where(and(eq(issues.id, id), eq(issues.organizationId, organizationId)));

    if (!issue) {
      throw new NotFoundException(`Issue #${id} not found in this organization`);
    }

    return issue;
  }

  async update(id: number, updateIssueDto: UpdateIssueDto, user: any) {
    const issue = await this.findOne(id, user.organizationId);
    
    // Update Issue
    const [updatedIssue] = await db.update(issues)
      .set({
        ...updateIssueDto,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    // Log Activities for Status or Assignee changes
    if (updateIssueDto.status && updateIssueDto.status !== issue.status) {
      await this.logActivity(id, 'UPDATE_STATUS', issue.status, updateIssueDto.status, user);
    }
    
    if (updateIssueDto.assigneeId && updateIssueDto.assigneeId !== issue.assigneeId) {
      await this.logActivity(id, 'UPDATE_ASSIGNEE', issue.assigneeId || 'Unassigned', updateIssueDto.assigneeId, user);
    }

    return updatedIssue;
  }

  async remove(id: number, user: any) {
    await this.findOne(id, user.organizationId);

    await db.delete(issues).where(eq(issues.id, id));
    
    // Log Activity (Optional since issue is gone, but good for audit if logs were separate)
    // In this schema, logs cascade delete or stay? 
    // Usually logs should stay, but simple implementation here.
  }

  private async logActivity(issueId: number, action: string, oldValue: string | null, newValue: string | null, user: any) {
    await db.insert(activityLogs).values({
      issueId,
      action,
      oldValue,
      newValue,
      actorId: user.userId,
      organizationId: user.organizationId,
    });
  }
}
