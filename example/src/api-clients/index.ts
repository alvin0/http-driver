import { DriverBuilder } from "../../../src";
import dummyjsonApiDriver from "./dummyjson-driver/driver";
import jsonPlaceholderApiDriver from "./jsonplaceholder-driver/driver";

export const httpJsonPlaceholderDriver = new DriverBuilder()
  .withBaseURL(jsonPlaceholderApiDriver.baseURL)
  .withServices(jsonPlaceholderApiDriver.services)
  .build();

export const httpDummyjsonApiDriver = new DriverBuilder()
  .withBaseURL(dummyjsonApiDriver.baseURL)
  .withServices(dummyjsonApiDriver.services)
  .build();
