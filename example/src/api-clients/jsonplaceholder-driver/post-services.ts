import { MethodAPI, ServiceApi } from "../../../../src/types/driver";

export enum JsonPlaceholderPostServiceIds {
  List = "jsonplaceholder.post.list",
  Store = "jsonplaceholder.post.store",
  Detail = "jsonplaceholder.post.detail",
  Update = "jsonplaceholder.post.update",
  Destroy = "jsonplaceholder.post.destroy",
  Restore = "jsonplaceholder.post.restore",
}

export default [
  {
    id: JsonPlaceholderPostServiceIds.List,
    url: "posts",
    method: MethodAPI.get,
  },
  {
    id: JsonPlaceholderPostServiceIds.Store,
    url: "posts",
    method: MethodAPI.post,
  },
  {
    id: JsonPlaceholderPostServiceIds.Detail,
    url: "posts/{id}",
    method: MethodAPI.get,
  },
  {
    id: JsonPlaceholderPostServiceIds.Update,
    url: "posts/{id}",
    method: MethodAPI.put,
  },
  {
    id: JsonPlaceholderPostServiceIds.Destroy,
    url: "posts/{id}",
    method: MethodAPI.delete,
  },
  {
    id: JsonPlaceholderPostServiceIds.Restore,
    url: "posts/{id}",
    method: MethodAPI.patch,
  },
] as ServiceApi[];
