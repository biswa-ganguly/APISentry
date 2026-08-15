import { describe, it, expect } from 'vitest';
import { FastApiAdapter, FlaskAdapter, DjangoAdapter } from '@apisentry/adapters';

describe('Python Backend Adapters', () => {
  describe('FastApiAdapter', () => {
    const adapter = new FastApiAdapter();

    it('parses FastAPI routes and normalizes parameters', () => {
      const code = `
from fastapi import FastAPI, BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: str

@app.get("/api/v1/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id}

@app.post("/api/v1/users")
def create_user(data: UserCreate):
    return {"status": "created"}
`;

      const providers = adapter.parseFile('/app/main.py', code);
      expect(providers.length).toBe(2);

      const getProvider = providers.find(p => p.method === 'GET');
      expect(getProvider).toBeDefined();
      expect(getProvider?.path).toBe('/api/v1/users/:user_id');
      expect(getProvider?.source?.adapter).toBe('fastapi');

      const postProvider = providers.find(p => p.method === 'POST');
      expect(postProvider).toBeDefined();
      expect(postProvider?.path).toBe('/api/v1/users');
      expect(postProvider?.request?.body).toHaveLength(2);
      expect(postProvider?.request?.body?.[0].name).toBe('name');
      expect(postProvider?.request?.body?.[1].name).toBe('email');
    });
  });

  describe('FlaskAdapter', () => {
    const adapter = new FlaskAdapter();

    it('parses Flask routes with methods and converter syntax', () => {
      const code = `
from flask import Flask

app = Flask(__name__)

@app.route("/api/items/<int:item_id>", methods=["GET", "PUT"])
def item_handler(item_id):
    return "ok"
`;

      const providers = adapter.parseFile('/app/app.py', code);
      expect(providers.length).toBe(2);

      const paths = providers.map(p => `${p.method} ${p.path}`);
      expect(paths).toContain('GET /api/items/:item_id');
      expect(paths).toContain('PUT /api/items/:item_id');
    });
  });

  describe('DjangoAdapter', () => {
    const adapter = new DjangoAdapter();

    it('parses Django path definitions', () => {
      const code = `
from django.urls import path
from . import views

urlpatterns = [
    path('api/orders/<int:order_id>/', views.order_detail),
]
`;

      const providers = adapter.parseFile('/app/urls.py', code);
      expect(providers.length).toBeGreaterThan(0);
      expect(providers[0].path).toBe('/api/orders/:order_id');
    });
  });
});
