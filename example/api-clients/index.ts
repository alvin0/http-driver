import { DriverBuilder } from "../../src";
import jsonPlaceholderApiDriver from "./jsonplaceholder-driver/driver";

export const httpJsonPlaceholderDriver = new DriverBuilder()
  .withBaseURL(jsonPlaceholderApiDriver.baseURL)
  .withServices(jsonPlaceholderApiDriver.services)
  .build();
