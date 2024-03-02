# Select Dropdown

## Use
In the `app.module.ts` import the `SelectDropdownModule`:
```typescript
...
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    SelectDropdownModule
  ]
  ...
})
```

Then you can use the `json-form` component in your templates:
```html
<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">1. Single Select Dropdown</h2>
<select-dropdown [instanceId]="'dropdown_1'" (searchChange)="searchChange($event)" tabindex="0" [multiple]="false" [(ngModel)]="singleSelect" [config]="config" [options]="options"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">2. Disabled Dropdown</h2>
<select-dropdown [instanceId]="'dropdown_2'" tabindex="0" [disabled]="true" [multiple]="false" [(ngModel)]="singleSelect" [config]="config" [options]="options"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">3. Multi Select Dropdown</h2>
<select-dropdown [instanceId]="'dropdown_3'" tabindex="0" (change)="changeValue($event)" [multiple]="true" [(ngModel)]="multiSelect" [config]="config" [options]="options"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">4. Options as array of string</h2>
<select-dropdown [instanceId]="'dropdown_4'" tabindex="0" [multiple]="true" [(ngModel)]="stringArray" [options]="stringOptions"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">5. Options as array of Objects</h2>
<select-dropdown tabindex="0" [multiple]="true" [(ngModel)]="objectsArray" [options]="options" [config]="config"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">6. Already selected options passed as value</h2>
<select-dropdown tabindex="0" [multiple]="true" [(ngModel)]="selectedOptions" [options]="options" [config]="config"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">7. Reset</h2>
<select-dropdown tabindex="0" [multiple]="true" [(ngModel)]="resetOption" [options]="options" [config]="config"></select-dropdown>

<h2 class="text-2xl font-normal leading-normal mt-0 my-2 text-blue-800">8. Custom option template</h2>
<select-dropdown [optionItemTemplate]="optionTemplate" [selectedItemTemplate]="optionTemplate" tabindex="0" [multiple]="false" [(ngModel)]="optTemplate" [options]="options" [config]="config"></select-dropdown>

<ng-template #optionTemplate let-item="item" let-config="config">
  <div class="flex flex-row items-center">
    <img src="{{item.picture}}" class="h-8 w-8">
    <span>{{item.name}} - {{item.balance}}</span>
  </div>
</ng-template>
```

## Style
The `json-form` component uses [Tailwind CSS](https://tailwindcss.com/) for styling. You can use the default Tailwind CSS styles, or you can customize them. To customize the styles, you can use the `tailwind.config` object. For example:
```html
<head>
  ...
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            clifford: '#da373d',
          }
        }
      }
    }
  </script>
</head>
```
Alternative you can use the `tailwind.config.js` file:
```javascript
module.exports = {
  content: [
    // '../../node_modules/@chistophhu/select-dropdown/**/*.{html,ts,css,scss,sass,less,styl}',
      './src/**/*.{html,ts,css,scss,sass,less,styl}',
      './projects/**/*.{html,ts,css,scss,sass,less,styl}'
  ],
  theme: {
    extend: {
      colors: {
        clifford: '#da373d',
      }
    }
  }
}
```

## Example
```typescript
export class AppComponent implements OnInit {
  title = "app"
  singleSelect: any = []
  multiSelect: any = []
  stringArray: any = []
  objectsArray: any = []
  optTemplate: any = []
  stringOptions = [
    "Burns Dalton",
    "Mcintyre Lawson",
    "Amie Franklin",
    "Amie Palmer",
    "Amie Andrews"
  ]

  config: SelectDropdownConfig = {
    displayKey: "name",
    search: true,
    limitTo: 0,
    height: "250px",
    enableSelectAll: true,
    placeholder: "Select",
    searchOnKey: "",
    moreText: "more",
    noResultsFound: "No results found!",
    searchPlaceholder: 'Search',
    clearOnSelection: false,
    inputDirection: 'ltr',
  };
  selectedOptions = [
    {
      _id: "5a66d6c31d5e4e36c7711b7a",
      index: 0,
      balance: "$2,806.37",
      picture: "http://placehold.it/32x32",
      name: "Burns Dalton"
    },
    {
      _id: "5a66d6c3657e60c6073a2d22",
      index: 1,
      balance: "$2,984.98",
      picture: "http://placehold.it/32x32",
      name: "Mcintyre Lawson"
    },
  ];
  options = [
    {
      _id: "5a66d6c31d5e4e36c7711b7a",
      index: 0,
      balance: "$2,806.37",
      picture: "http://placehold.it/32x32",
      name: "Burns Dalton"
    },
    {
      _id: "5a66d6c3657e60c6073a2d22",
      index: 1,
      balance: "$2,984.98",
      picture: "http://placehold.it/32x32",
      name: "Mcintyre Lawson"
    },
    {
      _id: "5a66d6c376be165a5a7fae33",
      index: 2,
      balance: "$2,794.16",
      picture: "http://placehold.it/32x32",
      name: "Amie Franklin"
    },
    {
      _id: "5a66d6c376be165a5a7fae34",
      index: 2,
      balance: "$3,794.16",
      picture: "http://placehold.it/32x32",
      name: "Amie Palmer"
    },
    {
      _id: "5a66d6c376be165a5a7fae37",
      index: 2,
      balance: "$4,794.16",
      picture: "http://placehold.it/32x32",
      name: "Amie Andrews"
    }
  ]
  resetOption: any
  selectForm?: UntypedFormGroup
  constructor(
    // private fromBuilder: UntypedFormBuilder,
    // private drodownService: SelectDropdownService
  ) {
    // this.selectForm = this.fromBuilder.group({
    //   selectDrop: [null, Validators.required]
    // })
  }
  ngOnInit() {
    this.resetOption = [this.options[0]]
  }
  changeValue($event: any) {
    console.log($event)
    // console.log(this.selectForm.getRawValue())
  }

  searchChange($event: Event) {
    // console.log($event)
  }

  reset() {
    this.resetOption = []
  }
}
```