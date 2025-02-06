import { MethodAPI, ServiceApi } from "../../../../src/utils/driver-contracts";

export enum DummyjsonPostServiceIds {
  List = "dummyjson.post.list",
  Store = "dummyjson.post.store",
  Detail = "dummyjson.post.detail",
  Update = "dummyjson.post.update",
  Destroy = "dummyjson.post.destroy",
  Restore = "dummyjson.post.restore",
}

export default [
  {
    id: DummyjsonPostServiceIds.List,
    url: "posts",
    method: MethodAPI.get,
  },
  {
    id: DummyjsonPostServiceIds.Store,
    url: "posts/add",
    method: MethodAPI.post,
  },
  {
    id: DummyjsonPostServiceIds.Detail,
    url: "posts/{id}",
    method: MethodAPI.get,
  },
  {
    id: DummyjsonPostServiceIds.Update,
    url: "posts/{id}",
    method: MethodAPI.put,
  },
  {
    id: DummyjsonPostServiceIds.Destroy,
    url: "posts/{id}",
    method: MethodAPI.delete,
  },
] as ServiceApi[];
