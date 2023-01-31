import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom, lastValueFrom, Observable, throwError} from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface TodoItem extends BaseTodoItem {
  id: string;
}

export interface BaseTodoItem {
  description: string;
  isCompleted: boolean;
}

export interface TodoItems {
  [key: string]: TodoItem;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private apiUrl = 'http://localhost:7002/api/todoitems';
  private constructor(private http: HttpClient) {
  }

  public async getTodoList(): Promise<Array<TodoItem>> {
    return firstValueFrom(this.http.get<Array<TodoItem>>(this.apiUrl));
  }

  public async getTodoListItem(id:string): Promise<Array<TodoItem>> {
    return firstValueFrom(this.http.get<Array<TodoItem>>(`${this.apiUrl}/${id}`));
  }

  public async postTodoListItem(data:BaseTodoItem): Promise<TodoItem> {
    return firstValueFrom(this.http.post<TodoItem>(this.apiUrl,data));
  }

  public async deleteTodoListItem(id:string): Promise<void> {
      return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  public async putTodoListItem(id:string, data:BaseTodoItem): Promise<Array<TodoItem>> {
    return firstValueFrom(this.http.put<Array<TodoItem>>(`${this.apiUrl}/${id}`,data));
  }
}
