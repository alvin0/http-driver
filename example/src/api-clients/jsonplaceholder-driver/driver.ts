import { DriverInformation, ServiceApi } from "../../../../src/types/driver";
import PostService from "./post-services";

const baseURL: string = "https://jsonplaceholder.typicode.com";

// register services
export const services: ServiceApi[] = [...PostService];

const jsonPlaceholderApiDriver: DriverInformation = {
  baseURL: baseURL,
  services: services,
};

export default jsonPlaceholderApiDriver;
