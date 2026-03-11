import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UpdateUserDto, AssignRoleDto } from './dto/user.dto';
import { users, roles, userRoles } from '../../db/schema';
import { eq, and, isNull, desc, SQL } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private dbService: DatabaseService) {}

  async findAll(workspaceId: string, page: number = 1, limit: number = 50) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Cap at 100

    return this.dbService.db.query.users.findMany({
      where: and(
        eq(users.workspaceId, workspaceId),
        isNull(users.deletedAt)
      ),
      with: {
        department: true,
        team: true,
        userRoles: {
          with: {
            role: true,
          },
        },
      },
      orderBy: [desc(users.createdAt)],
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit,
    });
  }

  async findOne(id: string, workspaceId: string) {
    const user = await this.dbService.db.query.users.findFirst({
      where: and(
        eq(users.id, id),
        eq(users.workspaceId, workspaceId),
        isNull(users.deletedAt)
      ),
      with: {
        department: true,
        team: true,
        userRoles: {
          with: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, workspaceId: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id, workspaceId);

    const [updatedUser] = await this.dbService.db
      .update(users)
      .set({
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        avatar: updateUserDto.avatar,
        departmentId: updateUserDto.departmentId,
        teamId: updateUserDto.teamId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    const [deletedUser] = await this.dbService.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }

  async assignRole(id: string, workspaceId: string, assignRoleDto: AssignRoleDto) {
    await this.findOne(id, workspaceId);

    const role = await this.dbService.db.query.roles.findFirst({
      where: and(
        eq(roles.id, assignRoleDto.roleId),
        eq(roles.workspaceId, workspaceId)
      ),
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingUserRole = await this.dbService.db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, id),
        eq(userRoles.roleId, assignRoleDto.roleId)
      ),
    });

    if (existingUserRole) {
      throw new BadRequestException('User already has this role');
    }

    await this.dbService.db.insert(userRoles).values({
      userId: id,
      roleId: assignRoleDto.roleId,
    });

    return this.findOne(id, workspaceId);
  }

  async removeRole(id: string, workspaceId: string, roleId: string) {
    await this.findOne(id, workspaceId);

    await this.dbService.db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.userId, id),
          eq(userRoles.roleId, roleId)
        )
      );

    return this.findOne(id, workspaceId);
  }

  async getProfile(userId: string, workspaceId: string) {
    return this.findOne(userId, workspaceId);
  }

  async updateProfile(userId: string, workspaceId: string, updateUserDto: UpdateUserDto) {
    return this.update(userId, workspaceId, updateUserDto);
  }
}
