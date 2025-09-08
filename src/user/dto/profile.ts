export class ProfileDto {
  profile: {
    id: number;
    nickname: string;
    email: string;
    avatarUrl: string;
    createdAt: string;
  };
  myCourses: Array<{
    id: number;
    title: string;
    length: number;
    createdAt: string;
    previewImageUrl: string;
  }>;
  myPosts: Array<{
    id: number;
    title: string;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
  }>;
  myPhotos: Array<{
    id: number;
    courseId: number;
    title: string;
    imageUrl: string;
    createdAt: string;
  }>;
}
