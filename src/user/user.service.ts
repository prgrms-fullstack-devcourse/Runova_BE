import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    )
  async updateAvatar(userId: number, key: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException();

    user.avatarKey = key;
    await this.userRepo.save(user);

    return { success: true, avatarKey: key };
  }
}
