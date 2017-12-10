import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';

import { Timeline } from '../models/timeline.model';
import { Helper } from '../../common/services/helper.service';


@Injectable()
export class TimelineService {

  timelineStoreVideoAPI: string = this.helper.getAPP('timeline/store-video');

  timelineType: string = "1";

  isPerson = "0";

  timelines: Timeline[] = [];
  CACHE_TIMELINES: string = 'cache_timelines';

  headers: Headers;
  requestOptions: RequestOptions;


  //
  // constructor
  constructor(
    public http: Http,
    public helper: Helper,
    public storage: Storage
  ) {
    this.headers = new Headers({'X-Requested-With': 'XMLHttpRequest'});
    this.requestOptions = new RequestOptions({headers: this.headers, withCredentials: true});
  }


  //
  // get timeline from storage
  getTimelinesFromStorage() {
    this.storage.get(this.CACHE_TIMELINES).then(value => {
      let timelines = JSON.parse(value);
      this.timelines = timelines;
    });
  }


  //
  // refresh
  refresh(params): Promise<Timeline[]> {
    let api: string = this.helper.getAPP('timeline?type=refresh&id=' + params.id + '&timelineType=' + this.timelineType);

    return this.http.get(api, this.requestOptions)
    .toPromise()
    .then(response => {
      let timelines = response.json();
      this.timelines = timelines.concat(this.timelines);
      this.storageTimelines();
      return response.json();
    })
    .catch(this.handleError);
  }


  //
  // infinite
  infinite(params): Promise<Timeline[]> {
    let api: string = this.helper.getAPP('timeline?type=infinite&id=' + params.id + '&timelineType=' + this.timelineType);

    return this.http.get(api, this.requestOptions)
    .toPromise()
    .then(response => {
      let timelines = response.json();
      this.timelines = this.timelines.concat(timelines);
      this.storageTimelines();
      return response.json();
    })
    .catch(this.handleError);
  }


  //
  // set like
  setLike(timeline): Promise<Timeline> {
    let api: string = this.helper.getAPP('timeline/setLike');
    //let data: any = {id: timeline.id};

    return this.http.post(api, timeline, this.requestOptions)
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError);
  }


  //
  // index
  index(): Promise<Timeline[]> {
    //
    let api: string = this.helper.getAPP('timeline?timelineType=' + this.timelineType);

    return this.http.get(api, this.requestOptions)
    .toPromise()
    .then(response => {
      this.timelines = response.json();

      this.storageTimelines();
      return response.json();
    })
    .catch(this.handleError);
  }


  //
  // store
  store(params): Promise<Timeline> {
    let api: string = this.helper.getAPP('timeline/store');

    return this.http.post(api, params, this.requestOptions)
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError);
  }


  //
  // update
  update(params): Promise<Timeline> {
    let api: string = this.helper.getAPP('timeline/update');
    let data: any = {content: params.content};

    return this.http.post(api, data, this.requestOptions)
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError);
  }


  //
  // destroy
  destroy(params): Promise<Timeline> {
    let api: string = this.helper.getAPP('timeline/destroy');
    let data: any = {id: params.id};

    return this.http.post(api, data, this.requestOptions)
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError);
  }


  //
  // store comment
  storeComment(params): Promise<Timeline> {
    let api: string = this.helper.getAPP('timeline/store-comment');
    let data: any = {
      timeline_id: params.timeline_id,
      content: params.content,
      timeline_comment_id: params.timeline_comment_id
    };

    return this.http.post(api, data, this.requestOptions)
    .toPromise()
    .then(response => response.json())
    .catch(this.handleError);
  }


  //
  //
  storageTimelines() {
    if(this.timelineType == '1'){
      let timelines = JSON.stringify(this.timelines);
      this.storage.set(this.CACHE_TIMELINES, timelines);
    }

  }


  //
  //
  clearCache() {
    this.storage.remove(this.CACHE_TIMELINES);
  }


  //
  // handle error
  private handleError(error: any) {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
