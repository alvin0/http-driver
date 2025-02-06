import { httpJsonPlaceholderDriver } from "../api-clients";
import { JsonPlaceholderPostServiceIds } from "../api-clients/jsonplaceholder-driver/post-services";

export class JsonPlaceholderApi {
  /**
   * handleJsonplaceholderList
   * Endpoint: GET /posts
   * No query parameters required.
   */
  public async handleJsonplaceholderList() {
    console.log("JSONPlaceholder: Listing posts");
    const response = await httpJsonPlaceholderDriver.execService({
      id: JsonPlaceholderPostServiceIds.List,
    });
    if (response.status === 200) {
      console.log("JSONPlaceholder List Response:", response.data);
    } else {
      console.error("JSONPlaceholder List Failed:", response.problem);
    }
  }

  public async handleJsonplaceholderStore() {
    console.log("JSONPlaceholder: Storing a new post");
    const payload = {
      title: "New JSONPlaceholder Post",
      userId: 1,
    };
    const response = await httpJsonPlaceholderDriver.execService(
      {
        id: JsonPlaceholderPostServiceIds.Store,
      },
      payload
    );
    if (response.status === 201) {
      console.log("JSONPlaceholder Store Response:", response.data);
    } else {
      console.error("JSONPlaceholder Store Failed:", response.problem);
    }
  }

  public async handleJsonplaceholderDetail() {
    console.log("JSONPlaceholder: Getting post detail for post ID 1");
    const response = await httpJsonPlaceholderDriver.execService({
      id: JsonPlaceholderPostServiceIds.Detail,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("JSONPlaceholder Detail Response:", response.data);
    } else {
      console.error("JSONPlaceholder Detail Failed:", response.problem);
    }
  }

  public async handleJsonplaceholderUpdate() {
    console.log("JSONPlaceholder: Updating post with ID 1");
    const payload = {
      title: "Updated JSONPlaceholder Title",
      body: "Updated JSONPlaceholder content",
    };
    const response = await httpJsonPlaceholderDriver.execService(
      {
        id: JsonPlaceholderPostServiceIds.Update,
        params: { id: 1 },
      },
      payload
    );
    if (response.status === 200) {
      console.log("JSONPlaceholder Update Response:", response.data);
    } else {
      console.error("JSONPlaceholder Update Failed:", response.problem);
    }
  }

  public async handleJsonplaceholderDestroy() {
    console.log("JSONPlaceholder: Destroying post with ID 1");
    const response = await httpJsonPlaceholderDriver.execService({
      id: JsonPlaceholderPostServiceIds.Destroy,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("JSONPlaceholder Destroy Response:", response.data);
    } else {
      console.error("JSONPlaceholder Destroy Failed:", response.problem);
    }
  }

  public async handleJsonplaceholderRestore() {
    console.log("JSONPlaceholder: Restoring post with ID 1");
    const response = await httpJsonPlaceholderDriver.execService({
      id: JsonPlaceholderPostServiceIds.Restore,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("JSONPlaceholder Restore Response:", response.data);
    } else {
      console.error("JSONPlaceholder Restore Failed:", response.problem);
    }
  }

  /**
   * handlePaginate
   * Endpoint: GET /posts with pagination options.
   */
  public async handlePaginate(limit: number, skip: number) {
    console.log(
      `JSONPlaceholder: Paginating posts with limit=${limit} and skip=${skip}`
    );
    const response = await httpJsonPlaceholderDriver.execService(
      {
        id: JsonPlaceholderPostServiceIds.List,
      },
      { limit, skip }
    );
    if (response.status === 200) {
      console.log("JSONPlaceholder Paginate Response:", response.data);
    } else {
      console.error("JSONPlaceholder Paginate Failed:", response.problem);
    }
  }

  /**
   * handleSortPosts
   * Endpoint: GET /posts with sort options.
   */
  public async handleSortPosts(sortBy: string, order: string) {
    console.log(
      `JSONPlaceholder: Sorting posts by ${sortBy} in ${order} order`
    );
    const response = await httpJsonPlaceholderDriver.execService(
      {
        id: JsonPlaceholderPostServiceIds.List,
      },
      { sortBy, order }
    );
    if (response.status === 200) {
      console.log("JSONPlaceholder Sort Response:", response.data);
    } else {
      console.error("JSONPlaceholder Sort Failed:", response.problem);
    }
  }

  /**
   * JSONPlaceholderCaller function to call all JSONPlaceholder API endpoints
   */
  public async jsonPlaceholderCaller() {
    await this.handleJsonplaceholderList();
    await this.handlePaginate(10, 10);
    await this.handleSortPosts("title", "asc");
    await this.handleJsonplaceholderStore();
    await this.handleJsonplaceholderDetail();
    await this.handleJsonplaceholderUpdate();
    await this.handleJsonplaceholderDestroy();
    await this.handleJsonplaceholderRestore();
  }
}
