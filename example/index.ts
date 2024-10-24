import { httpJsonPlaceholderDriver } from "./api-clients";
import { JsonPlaceholderPostServiceIds } from "./api-clients/jsonplaceholder-driver/post-services";

const fetchListPost = async () => {
  const response = await httpJsonPlaceholderDriver.execService({
    id: JsonPlaceholderPostServiceIds.List,
  });

  if (response.status === 200) {
    return response.data;
  }
};

const fetchPostDetail = async (id: number) => {
  const response = await httpJsonPlaceholderDriver.execService({
    id: JsonPlaceholderPostServiceIds.Detail,
    params: { id: id },
  });

  if (response.status === 200) {
    return response.data;
  }
};
