import {Component, OnInit} from '@angular/core';
import {BackendService, BaseTodoItem, TodoItem} from "./services/backend.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
/**
*  MY RATIONALE:
 *
 * I have taken the position of "less is more", simplicity and keeping close to the context of the brief.
 * The brief espouses a simple application, so the codebase has been kept fairly straight forward
 * with only 1 service and 1 module/component.
 *
 * Simply put I didn't want to over bake it.
 *
 * I have added some basic styling but kept to overall look and feel.
 *
 * I have kept the data management on the front end simple by just requesting the whole list at each update.
 * There was the possibility of managing the list state locally as it is a simple application and while the chance of the
 * list becoming stale with this sort incremental management strategy (IE: adding the item to the list as a result of
 * the input or the individual response from the back end) is minimal it is a simple application, so I refresh the list
 * wholesale each time ensuring it won't get out of sync.
 *
 * There is an argument to say that when the list becomes larger my solution becomes less viable and that is true but
 * for that to happen we would need to consider a database and much larger datasets ( likely multiuser ) and now we are
 * talking fetching, sorting and pagination done by the database so more complex code.  However, my current solution would
 * still actually work under this circumstance and managing incremental list state locally would then be a team preference
 * and would suggest a wider play is in progress, but for this exercise I took the stance that there is not a wider
 * play in progress.  I also took this stance, in regard to any componentization.  To my mind 1 is sufficient for this
 * task.
 *
 * The node backend, while tempting to refactor and tidy to my liking, I found to be readable and understandable. So I
 * made minimal consequential changes to the backend.
 *
 * The one change I did make was to the post and put routes.  I check for the existence of the ID member being passed in.
 * The reason for this is that the create and update code was structured in a way that you could create your own ids and
 * overwrite the assigned id.  The other option is more checking in the create and update methods, but I like the
 * simplicity of that code and validating the request as a habit is more prudent in my opinion.
 *
 * TESTS:
 *
 *      In my opinion testing is a progressive discipline, so testing lacking now can be made up for in the future when
 *      required.
 *
 *      I have not specifically unit tested anything, per se, as there is really not that much logic to test.
 *      Of course this is a subjective opinion of mine, because a case could always be made but my position here is
 *      that these test would add more complexity to the system than the value they would bring.  The exception here
 *      is the error handlers. If they were to get more complex, then they would benefit from a unit test.
 *
 *      I have UI tested the primary functionality.  I have chosen because of the limited scope of this test
 *      to use css selectors rather than a page model, although personally I would favour simple selectors over
 *      a more complex page model.
 *
 *      The post to the backend is mocked, and there already exist tests
 *      of the API around posting.  I have also added two tests to the create in the back end.
 *
 *
 *
 *
 **/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'TodoList';
  public cachedData: Array<TodoItem> = [];
  public itemForm: FormGroup;
  public itemControl: FormControl;
  public generalErrorMessage = '';

  public constructor(
    private backendService: BackendService
  ) {
    this.itemControl = new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!.*(cat|dog|yes|no))/g)
    ]);
    this.itemForm = new FormGroup({
      "item": this.itemControl
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.fetchCacheRemoteData();
  }
  // main
  public async submit(): Promise<void> {

    try {
      if (this.itemForm.invalid) {
        return;
      }

      const description = this.itemControl.value;

      await this.backendService.postTodoListItem({
        description,
        isCompleted: false
      });
      this.resetForm();

    } catch (err) {
      this.generalExceptionHandler(err);
    } finally {
      await this.fetchCacheRemoteData();
      // After any remote call the state will technically be unknown.
      // The call may have succeeded or failed or misinformed about its state.
      // I have chosen to resolve this situation by simply re-syncing with the server
      // in the case where the system becomes multi-user or requires pagination
      // this would still hold true but page and page size would have to be added.
    }
  }

  // Update Item
  public async markAsComplete(todoItem: TodoItem): Promise<void> {
    const {id, description} = todoItem;

    try {
      await this.backendService.putTodoListItem(id, {
        description,
        isCompleted: true
      });
    } catch (err) {
      this.generalExceptionHandler(err);
    } finally {
      await this.fetchCacheRemoteData();
    }
  }

  // Delete Item
  public async markForDeletion(id: string): Promise<void> {

    try {
      await this.backendService.deleteTodoListItem(id);
    } catch (err) {
      this.generalExceptionHandler(err);
    } finally {
      await this.fetchCacheRemoteData();
    }
  }


  // Error handlers

  public generalExceptionHandler(err: {error:"",status:number}): void {

    if ( err?.status >= 500 ){
      this.generalErrorMessage = "The server has a temporary fault.";
    }
    if ( err?.status >= 400 && err?.status < 500 ) {
      this.generalErrorMessage = err?.error
    }
    if ( err?.status < 100 ) {
      this.generalErrorMessage = "Something is awry";
    }


    // Some more clever server error response handling can go here.
    // options:
    //          Timeout to clear the error message. but code becomes more complex to handle async overwriting of
    //          subsequent server messages and simple id almost always better than complex.
  }

  public get generalErrorException(): string {
    return this.generalErrorMessage;
  }

  public prescribedErrorException(): string {

    if (this.itemControl.invalid && (this.itemControl.dirty || this.itemControl.touched)) {
      if (this.itemControl.errors?.['required']){
        return 'A description is required.';
      }
      if (this.itemControl.errors?.['pattern']){
        return 'Cannot contain the words cat, dog, yes or no.';
      }

    }
    // if ( this.detectDuplicateDescriptions(this.itemControl.value)){
    //   return 'This description already exists, there can be only one.';
    // }
    return '';

    // Possible extra error handling
    // options:
    //          uncomment handle duplicate descriptions locally.  Commented so server side messages come thru.

  }

  public detectDuplicateDescriptions(description:string):boolean{
      return this.cachedData.some((todoItem) => todoItem.description === description);
  }

  // Get Items
  public async fetchCacheRemoteData(): Promise<void> {
    try {

      // Sorting is done here for visibility.  Doing this in the backend service is a reasonable option
      // but more reasonable is replacing the current node storage method with a database and have the
      // database do the sorting.
      const latestTodoList: Array<TodoItem> = await this.backendService.getTodoList();
      this.cachedData = latestTodoList.sort(function (a, b) {
        const A = a.description.toUpperCase();
        const B = b.description.toUpperCase();
        return (A < B) ? -1 : (A > B) ? 1 : 0;
      });
    } catch( err ){
      this.generalExceptionHandler(err);
    }
  }



  // View Helpers
  public resetForm(): void {
    this.itemForm.reset();
    this.generalErrorMessage=""; // blunt manual handling of aged server error messages, in lieu of a wider error handling
                                 // strategy should the scope of this small app be expanded.
  }

  public get viewCachedTodoItems(): Array<TodoItem> {
    return this.cachedData;
  }

}
