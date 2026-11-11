import { HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';


@Injectable()
export class OrdersService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger("OrdersService");

  constructor(
  ) {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async create(createOrderDto: CreateOrderDto) {

    return {
      service:'Orders Microservice',
      createOrderDto
    }
    // try {
    //   return await this.order.create({
    //     data: createOrderDto
    //   });
    // } catch (error) {
    //   throw new RpcException({
    //     status: 400,
    //     message: (error as Error).message,
    //   });
    // }
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });

    const currentPage = orderPaginationDto.page!;
    const perPage = orderPaginationDto.limit!;

    return {
      data: await this.order.findMany({
        skip: (currentPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found.`

      })
    }

    return order;
  }

  async changeStatus(ChangeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = ChangeOrderStatusDto;
    const order = await this.findOne(id);
    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id: id },
      data: { status: status }
    })
  }

}
