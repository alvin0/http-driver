import { httpDummyjsonApiDriver } from "../api-clients";
import { DummyjsonPostServiceIds } from "../api-clients/dummyjson-driver/post-services";

export class DummyJSONApi {
  /**
   * handleDummyjsonList
   * Endpoint: GET /posts
   * No query parameters required.
   * Documentation: https://dummyjson.com/docs/posts shows that fetching posts returns a list of posts.
   */
  public async handleDummyjsonList() {
    console.log("DummyJSON: Listing posts");
    const response = await httpDummyjsonApiDriver.execService({
      id: DummyjsonPostServiceIds.List,
    });
    if (response.status === 200) {
      console.log("DummyJSON List Response:", response.data);
    } else {
      console.error("DummyJSON List Failed:", response.problem);
    }
  }

  public async handleDummyjsonStore() {
    console.log("DummyJSON: Storing a new post");
    const payload = {
      title: "New DummyJSON Post",
      userId: 1,
    };
    const response = await httpDummyjsonApiDriver.execService(
      {
        id: DummyjsonPostServiceIds.Store,
      },
      payload
    );
    if (response.status === 201) {
      console.log("DummyJSON Store Response:", response.data);
    } else {
      console.error("DummyJSON Store Failed:", response.problem);
    }
  }

  public async handleDummyjsonDetail() {
    console.log("DummyJSON: Getting post detail for post ID 1");
    const response = await httpDummyjsonApiDriver.execService({
      id: DummyjsonPostServiceIds.Detail,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("DummyJSON Detail Response:", response.data);
    } else {
      console.error("DummyJSON Detail Failed:", response.problem);
    }
  }

  public async handleDummyjsonUpdate() {
    console.log("DummyJSON: Updating post with ID 1");
    const payload = {
      title: "Updated DummyJSON Title",
      body: "Updated DummyJSON content",
    };
    const response = await httpDummyjsonApiDriver.execService(
      {
        id: DummyjsonPostServiceIds.Update,
        params: { id: 1 },
      },
      payload
    );
    if (response.status === 200) {
      console.log("DummyJSON Update Response:", response.data);
    } else {
      console.error("DummyJSON Update Failed:", response.problem);
    }
  }

  public async handleDummyjsonDestroy() {
    console.log("DummyJSON: Destroying post with ID 1");
    const response = await httpDummyjsonApiDriver.execService({
      id: DummyjsonPostServiceIds.Destroy,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("DummyJSON Destroy Response:", response.data);
    } else {
      console.error("DummyJSON Destroy Failed:", response.problem);
    }
  }

  public async handleDummyjsonRestore() {
    console.log("DummyJSON: Restoring post with ID 1");
    const response = await httpDummyjsonApiDriver.execService({
      id: DummyjsonPostServiceIds.Restore,
      params: { id: 1 },
    });
    if (response.status === 200) {
      console.log("DummyJSON Restore Response:", response.data);
    } else {
      console.error("DummyJSON Restore Failed:", response.problem);
    }
  }

  /**
   * handlePaginate
   * Endpoint: GET /posts with pagination options.
   * Accepts query parameters:
   *   - limit: number, the maximum number of posts to return.
   *   - skip: number, the number of posts to skip.
   * Documentation: https://dummyjson.com/docs/posts shows that you can pass limit and skip as query parameters.
   */
  public async handlePaginate(limit: number, skip: number) {
    console.log(
      `DummyJSON: Paginating posts with limit=${limit} and skip=${skip}`
    );
    const response = await httpDummyjsonApiDriver.execService(
      {
        id: DummyjsonPostServiceIds.List,
      },
      { limit, skip }
    );
    if (response.status === 200) {
      console.log("DummyJSON Paginate Response:", response.data);
    } else {
      console.error("DummyJSON Paginate Failed:", response.problem);
    }
  }

  /**
   * handleSortPosts
   * Endpoint: GET /posts with sort options.
   * Accepts query parameters:
   *   - sortBy: string, the field to sort by (e.g., title, id, etc.)
   *   - order: string, "asc" for ascending or "desc" for descending order.
   * Documentation: https://dummyjson.com/docs/posts explains that you can pass sortBy and order as query parameters to sort the results.
   */
  public async handleSortPosts(sortBy: string, order: string) {
    console.log(`DummyJSON: Sorting posts by ${sortBy} in ${order} order`);
    const response = await httpDummyjsonApiDriver.execService(
      {
        id: DummyjsonPostServiceIds.List,
      },
      { sortBy, order }
    );
    if (response.status === 200) {
      console.log("DummyJSON Sort Response:", response.data);
    } else {
      console.error("DummyJSON Sort Failed:", response.problem);
    }
  }

  /**
   * DummyJSONCaller function to call all the API methods
   */
  public async dummyJSONCaller() {
    await this.handleDummyjsonList();
    await this.handlePaginate(10, 10);
    await this.handleSortPosts("title", "asc");
    await this.handleDummyjsonStore();
    await this.handleDummyjsonDetail();
    await this.handleDummyjsonUpdate();
    await this.handleDummyjsonDestroy();
    await this.handleDummyjsonRestore();
  }
}
