import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { readFile } from "node:fs/promises";
import { faker } from "@faker-js/faker/locale/ko";

describe('e2e', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {

    const moduleFixture: TestingModule = await Test
        .createTestingModule({ imports: [AppModule] })
        .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/courses', () => {

    let authToken: string;
    let userId: number;
    let courseId: number;

    beforeEach(async () => {
      authToken = 'mock-jwt-token';
      userId = 8;
    });

    describe('POST /api/courses', () => {
      let mockCourseData: Record<string, any>;

      beforeEach(async () => {
        const raw = await readFile("../data.json", "utf-8");
        const path: [number, number][] = JSON.parse(raw).path;

        mockCourseData = {
          title: 'test course',
          imageUrl: faker.internet.url(),
          path,
        };
      })

      it('should create a new course', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/courses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(mockCourseData)
          .expect(201);
      });

      it('should return 400 for invalid course data', async () => {
        const invalidData = {
          title: '', // invalid empty title
          imageURL: 'invalid-url',
          path: [{ latitude: 37.5665 }] // missing longitude and insufficient path length
        };

        await request(app.getHttpServer())
          .post('/api/courses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/courses')
          .send(mockCourseData)
          .expect(403);
      });
    });

    describe('GET /api/courses/search/users', () => {
      it('should return user courses with pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/courses/search/users')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should return user courses without pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/courses/search/users')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('results');
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/search/users')
          .expect(403);
      });
    });

    describe('GET /api/courses/search/bookmarked', () => {
      it('should return bookmarked courses', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/courses/search/bookmarked')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/search/bookmarked')
          .expect(403);
      });
    });

    describe('GET /api/courses/search/completed', () => {
      it('should return completed courses', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/courses/search/completed')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/search/completed')
          .expect(403);
      });
    });

    describe('GET /api/courses/search/adjacent', () => {
      it('should return adjacent courses with required query params', async () => {
        const query = {
          latitude: 37.5665,
          longitude: 126.9780,
          radius: 1000
        };

        const response = await request(app.getHttpServer())
          .get('/api/courses/search/adjacent')
          .set('Authorization', `Bearer ${authToken}`)
          .query(query)
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should return 400 without required query params', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/search/adjacent')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/search/adjacent')
          .query({
            latitude: 37.5665,
            longitude: 126.9780,
            radius: 1000
          })
          .expect(403);
      });
    });

    describe('GET /api/courses/:id/nodes', () => {
      beforeEach(() => {
        courseId = 1; // Mock course ID - adjust based on your test setup
      });

      it('should return course nodes', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/courses/${courseId}/nodes`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should return 404 for non-existent course', async () => {
        await request(app.getHttpServer())
          .get('/api/courses/999999/nodes')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .get(`/api/courses/${courseId}/nodes`)
          .expect(403);
      });
    });

    describe('PUT /api/courses/:id/bookmarks', () => {
      beforeEach(() => {
        courseId = 1; // Mock course ID - adjust based on your test setup
      });

      it('should toggle bookmark status', async () => {
        const response = await request(app.getHttpServer())
          .put(`/api/courses/${courseId}/bookmarks`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(205);

        expect(response.body).toHaveProperty('bookmarked');
        expect(typeof response.body.bookmarked).toBe('boolean');
      });

      it('should return 404 for non-existent course', async () => {
        await request(app.getHttpServer())
          .put('/api/courses/999999/bookmarks')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .put(`/api/courses/${courseId}/bookmarks`)
          .expect(403);
      });
    });

    describe('DELETE /api/courses/:id', () => {
      beforeEach(() => {
        courseId = 1; // Mock course ID - adjust based on your test setup
      });

      it('should delete a course', async () => {
        await request(app.getHttpServer())
          .delete(`/api/courses/${courseId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);
      });

      it('should return 403 when trying to delete another user\'s course', async () => {
        // This assumes the course belongs to a different user
        await request(app.getHttpServer())
          .delete('/api/courses/999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403);
      });

      it('should return 403 without authentication', async () => {
        await request(app.getHttpServer())
          .delete(`/api/courses/${courseId}`)
          .expect(403);
      });
    });
  });

});
