import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getEvents(filters: { startDate?: string; endDate?: string; type?: string }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    }

    if (filters.type) where.type = filters.type;

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async createEvent(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    type?: string;
    color?: string;
    location?: string;
    attendees?: string[];
    createdBy?: string;
  }) {
    return this.prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay || false,
        type: data.type || 'meeting',
        color: data.color,
        location: data.location,
        attendees: data.attendees || [],
        createdBy: data.createdBy,
      },
    });
  }

  async updateEvent(id: string, data: Record<string, any>) {
    const update: any = { ...data };
    if (data.startDate) update.startDate = new Date(data.startDate);
    if (data.endDate) update.endDate = new Date(data.endDate);
    return this.prisma.calendarEvent.update({ where: { id }, data: update });
  }

  async deleteEvent(id: string) {
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
