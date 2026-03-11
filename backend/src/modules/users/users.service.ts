import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, AssignRoleDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    return this.prisma.user.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        department: true,
        team: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
      include: {
        department: true,
        team: true,
        userRoles: {
          include: {
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

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        avatar: updateUserDto.avatar,
        departmentId: updateUserDto.departmentId,
        teamId: updateUserDto.teamId,
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        email: undefined,
      },
    });
  }

  async assignRole(
    id: string,
    workspaceId: string,
    assignRoleDto: AssignRoleDto,
  ) {
    await this.findOne(id, workspaceId);

    const role = await this.prisma.role.findFirst({
      where: {
        id: assignRoleDto.roleId,
        workspaceId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingUserRole = await this.prisma.userRole.findFirst({
      where: {
        userId: id,
        roleId: assignRoleDto.roleId,
      },
    });

    if (existingUserRole) {
      throw new BadRequestException('User already has this role');
    }

    await this.prisma.userRole.create({
      data: {
        userId: id,
        roleId: assignRoleDto.roleId,
      },
    });

    return this.findOne(id, workspaceId);
  }

  async removeRole(id: string, workspaceId: string, roleId: string) {
    await this.findOne(id, workspaceId);

    await this.prisma.userRole.deleteMany({
      where: {
        userId: id,
        roleId,
      },
    });

    return this.findOne(id, workspaceId);
  }

  async getProfile(userId: string, workspaceId: string) {
    return this.findOne(userId, workspaceId);
  }

  async updateProfile(
    userId: string,
    workspaceId: string,
    updateUserDto: UpdateUserDto,
  ) {
    return this.update(userId, workspaceId, updateUserDto);
  }
}
