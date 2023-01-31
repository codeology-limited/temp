import {TestBed} from '@angular/core/testing';

import {HttpClientModule} from "@angular/common/http";

import {AppComponent} from './app.component';
import {BackendService, BaseTodoItem, TodoItem} from "./services/backend.service";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";


describe('AppComponent', () => {
  beforeEach(async () => {

    const backendServiceMock = jasmine.createSpyObj(['postTodoListItem','getTodoList']);
    backendServiceMock.postTodoListItem.and.returnValue( Promise.resolve({}));
    backendServiceMock.getTodoList.and.returnValue( Promise.resolve([{
      id:"qwerty1",
      description:"This is a mock item",
      isCompleted: false
    }]));

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers:[
        HttpClient,
        { provide: BackendService, useValue: backendServiceMock }
      ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
  });

  it('should display the title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.h4')?.textContent).toContain('Todo List App (Angular)');
  });


  it('should disable add item button until form is valid', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue();

    fixture.componentInstance.itemControl.setValue("a todo item");
    fixture.componentInstance.itemControl.markAsDirty()

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeFalse()

  });


  it('should add an item', async() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.itemControl.setValue("This text is irrelevant as the tested text comes from the mock");
    fixture.componentInstance.itemControl.markAsDirty()
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeFalse()
    fixture.debugElement.nativeElement.querySelector('button[type=submit]').click();

    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue()
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody tr td:nth-child(2)')?.textContent).toContain('This is a mock item');
  });

  it('should set a validation error class for descriptions that contain cat', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.itemControl.setValue("taco cat backwards spells taco cat");
    fixture.componentInstance.itemControl.markAsDirty()

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form .alert').textContent).toContain('Cannot contain the words cat, dog, yes or no.');

  });

  it('should set a validation error class for descriptions that contain dog', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.itemControl.setValue("who let the dogs out");
    fixture.componentInstance.itemControl.markAsDirty();

    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector('form .alert').textContent
    expect(fixture.nativeElement.querySelector('form .alert').textContent).toContain('Cannot contain the words cat, dog, yes or no.');

  });

  it('should set a validation error class for descriptions that contain yes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.itemControl.setValue("the man from delmonte he say yes");
    fixture.componentInstance.itemControl.markAsDirty();

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form .alert').textContent).toContain('Cannot contain the words cat, dog, yes or no.');

  });

  it('should set a validation error class for descriptions that contain no', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.itemControl.setValue("computer says no");
    fixture.componentInstance.itemControl.markAsDirty()

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form .alert').textContent).toContain('Cannot contain the words cat, dog, yes or no.');

  });





  //
  // it('should return true', () => {
  //   let comp = new AppComponent(new BackendService());
  //   expect(comp.abc).toBeTrue();
  // });
  //


});
