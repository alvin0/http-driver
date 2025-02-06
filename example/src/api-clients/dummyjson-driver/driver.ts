import {
  DriverInformation,
  ServiceApi,
} from "../../../../src/utils/driver-contracts";
import PostService from "./post-services";

const baseURL: string = "https://dummyjson.com";

// register services
export const services: ServiceApi[] = [...PostService];

const dummyjsonApiDriver: DriverInformation = {
  baseURL: baseURL,
  services: services,
};

export default dummyjsonApiDriver;
