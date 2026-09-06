import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Subject
} from 'rxjs';

export interface MinimizedEntityItem {
  key: string;
  entityType: string;
  entityId: number | string;
  title: string;
  entity?: any;
  minimizedAt: number;
}


@Injectable({
  providedIn: 'root'
})
export class EntityWindowManagerService {

  private readonly MAX_ITEMS = 5;

  private readonly STORAGE_KEY =
    'minimizedEntityTrayItems';


  private readonly itemsSubject =
    new BehaviorSubject<
      MinimizedEntityItem[]
    >(
      this.loadItems()
    );


  items$ =
    this.itemsSubject
      .asObservable();


  private readonly maximizeSubject =
    new Subject<
      MinimizedEntityItem
    >();


  maximize$ =
    this.maximizeSubject
      .asObservable();


  get items():
    MinimizedEntityItem[] {

    return this.itemsSubject
      .value;
  }


  minimize(
    item: {
      entityType: string;
      entityId: number | string;
      title: string;
      entity?: any;
    }
  ): void {

    const key =
      `${item.entityType}-${item.entityId}`;


    let items = [
      ...this.itemsSubject.value
    ];

    items =
      items.filter(
        x =>
          x.key !== key
      );


    items.push({

      ...item,

      key,

      minimizedAt:
        Date.now()

    });


    /*
     * Maximum 5 items.
     */
    if (
      items.length >
      this.MAX_ITEMS
    ) {

      items.shift();
    }


    this.updateItems(
      items
    );
  }


  maximize(
    item:
      MinimizedEntityItem
  ): void {

    this.maximizeSubject
      .next(
        item
      );
  }


  remove(
    key: string
  ): void {

    const items =
      this.itemsSubject
        .value
        .filter(
          x =>
            x.key !== key
        );


    this.updateItems(
      items
    );
  }


  closeAll(): void {

    this.updateItems(
      []
    );
  }


  /*
   * Call this on logout.
   */
  clearOnLogout(): void {

    this.itemsSubject
      .next(
        []
      );


    localStorage
      .removeItem(
        this.STORAGE_KEY
      );
  }


  /*
   * ============================================================
   * STORAGE
   * ============================================================
   */

  private updateItems(
    items:
      MinimizedEntityItem[]
  ): void {

    this.itemsSubject
      .next(
        items
      );


    this.saveItems(
      items
    );
  }


  private saveItems(
    items:
      MinimizedEntityItem[]
  ): void {

    try {

      localStorage
        .setItem(

          this.STORAGE_KEY,

          JSON.stringify(
            items
          )

        );

    } catch (
      error
    ) {

    }
  }


  private loadItems():
    MinimizedEntityItem[] {

    try {

      const saved =
        localStorage
          .getItem(
            this.STORAGE_KEY
          );


      if (!saved) {
        return [];
      }


      const items =
        JSON.parse(
          saved
        );


      if (
        !Array.isArray(
          items
        )
      ) {

        return [];
      }


      return items
        .filter(
          item =>
            item &&
            item.key &&
            item.entityType &&
            item.entityId !== null &&
            item.entityId !== undefined
        )
        .slice(
          -this.MAX_ITEMS
        );

    } catch (
      error
    ) {

      localStorage
        .removeItem(
          this.STORAGE_KEY
        );


      return [];
    }
  }
}