import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren, forwardRef } from '@angular/core';
import { SelectDropdownConfig } from './model/select-dropdown-config.model';
import { CommonModule } from '@angular/common';
import { FilterByPipe } from './pipes/filter-by/filter-by.pipe';
import { LimitToPipe } from './pipes/limit-to/limit-to.pipe';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxSelectDropdownService } from './services/ngx-select-dropdown.service';

const config: SelectDropdownConfig = {
  displayKey: "description",
  height: "auto",
  search: false,
  placeholder: "Select",
  searchPlaceholder: "Search...",
  limitTo: 0,
  customComparator: () => 0,
  noResultsFound: "No results found!",
  moreText: "more",
  searchOnKey: '',
  clearOnSelection: false,
  inputDirection: "ltr",
  selectAllLabel: "Select all",
  enableSelectAll: false,
}

@Component({
  selector: 'select-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FilterByPipe,
    FormsModule,
    LimitToPipe
  ],
  templateUrl: './ngx-select-dropdown.component.html',
  styleUrls: ['./ngx-select-dropdown.component.sass'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxSelectDropdownComponent),
      multi: true,
    },
  ]
})
export class NgxSelectDropdownComponent {
  
@Input() public _value: any
@Input() public options: any = []
@Input() public config: SelectDropdownConfig = config
@Input() public multiple: boolean = false
@Input() public disabled: boolean = false

/** unique identifier to uniquely identify particular instance */
@Input() public instanceId: any

@Input() selectedItemTemplate?: TemplateRef<any>
@Input() optionItemTemplate?: TemplateRef<any>
@Input() dropdownButtonTemplate?: TemplateRef<any>

@Output() public change: EventEmitter<any> = new EventEmitter()
@Output() public searchChange: EventEmitter<any> = new EventEmitter()
@Output() public open: EventEmitter<any> = new EventEmitter()
@Output() public close: EventEmitter<any> = new EventEmitter()

public toggleDropdown: boolean = false
public availableItems: any = []
public selectedItems: any = []
selectedDisplayText: string = "wählen..."
public searchText: string = ''
public clickedInside: boolean = false
public insideKeyPress: boolean = false
public focusedItemIndex: number = 0 // null
public showNotFound: boolean = false
public top: string = '10'
public optionMouseDown: boolean = false
private dropdownList?: ElementRef
public selectAll: boolean

@ViewChildren("availableOption")
public availableOptions?: QueryList<ElementRef>

get value() {
  return this._value
}
set value(val) {
  this._value = val
  this.onChange(val)
  this.onTouched()
}

constructor(private cdref: ChangeDetectorRef, public _elementRef: ElementRef, private dropdownService: NgxSelectDropdownService) {
  this.multiple = false
  this.selectAll = false
}

public onChange: any = () => {}
public onTouched: any = () => {}

@HostListener("click")
public clickInsideComponent() {
  this.clickedInside = true
}

@ViewChild("dropdownList") set dropDownElement(ref: ElementRef) {
  if (ref) {
    this.dropdownList = ref
  }
}

@HostListener("blur") public blur() {
  if (!this.insideKeyPress && !this.optionMouseDown) {
    this.toggleDropdown = false
    this.openStateChange()
  }
}

@HostListener("focus") public focus() {
  if (!this.disabled) {
    this.toggleDropdown = true
    this.openStateChange()
  }
}

@HostListener("document:click") public clickOutsideComponent() {
  if (!this.clickedInside) {
    this.toggleDropdown = false
    this.openStateChange()
    this.resetArrowKeyActiveElement()
    this.searchText = ''
    this.close.emit()
  }
  this.clickedInside = false
}

@HostListener("document:keydown") public KeyPressOutsideComponent() {
  if (!this.insideKeyPress) {
    this.toggleDropdown = false
    this.openStateChange()
    this.resetArrowKeyActiveElement()
  }
  this.insideKeyPress = false
}

@HostBinding("attr.tabindex") tabindex = 0

@HostListener("keydown", ["$event"]) public handleKeyboardEvent($event: KeyboardEvent | any) {
  this.insideKeyPress = true
  if ($event.keyCode === 27 || this.disabled) {
    this.toggleDropdown = false
    this.openStateChange()
    this.insideKeyPress = false
    return
  }
  const avaOpts = this.availableOptions?.toArray()
  if (avaOpts && $event.keyCode !== 9 && avaOpts.length === 0 && !this.toggleDropdown) {
    this.toggleDropdown = true
    this.openStateChange()
  }
  // Arrow Down
  if (avaOpts && $event.keyCode === 40 && avaOpts.length > 0) {
    this.onArrowKeyDown()
    if (this.focusedItemIndex >= avaOpts.length) {
      this.focusedItemIndex = 0
    }
    avaOpts[this.focusedItemIndex].nativeElement.focus()
    $event.preventDefault()
  }
  // Arrow Up
  if (avaOpts && $event.keyCode === 38 && avaOpts.length) {
    this.onArrowKeyUp()
    if (this.focusedItemIndex >= avaOpts.length) {
      this.focusedItemIndex = avaOpts.length - 1
    }
    avaOpts[this.focusedItemIndex].nativeElement.focus()
    $event.preventDefault()
  }
  // Enter
  /* istanbul ignore else */
  if ($event.keyCode === 13 && this.focusedItemIndex !== null) {
    const filteredItems = new FilterByPipe().transform(
      this.availableItems,
      this.searchText,
      this.config.searchOnKey
    )
    this.selectItem(
      filteredItems[this.focusedItemIndex],
      this.availableItems.indexOf(filteredItems[this.focusedItemIndex])
    )
    return false
  }
  return
}

public ngOnInit() {
  if (typeof this.options !== "undefined" && typeof this.config !== "undefined" && Array.isArray(this.options)) {
    this.availableItems = [
      ...this.options.sort(this.config.customComparator),
    ]
    this.initDropdownValuesAndOptions()
  }
  this.serviceSubscriptions()
}

isVisible() {
  if (!this.dropdownList) {
    return { visible: false, element: null }
  }
  const el = this.dropdownList.nativeElement
  if (!el) {
    return { visible: false, element: el }
  }
  const rect = el.getBoundingClientRect()
  const topShown = rect.top >= 0
  const bottomShown = rect.bottom <= window.innerHeight
  return { visible: topShown && bottomShown, element: el }
}

serviceSubscriptions() {
  this.dropdownService.openDropdownInstance.subscribe((instanceId: any) => {
    if (this.instanceId === instanceId) {
      this.toggleDropdown = true
      this.openStateChange()
      this.resetArrowKeyActiveElement()
    }
  })
  this.dropdownService.closeDropdownInstance.subscribe((instanceId: any) => {
    if (this.instanceId === instanceId) {
      this.toggleDropdown = false
      this.openStateChange()
      this.resetArrowKeyActiveElement()
    }
  })
}

public ngAfterViewInit() {
  this.availableOptions?.changes.subscribe(this.setNotFoundState.bind(this))
}

public registerOnChange(fn: any) {
  this.onChange = fn
}

public registerOnTouched(fn: any) {
  this.onTouched = fn
}

public setDisabledState(isDisabled: boolean) {
  this.disabled = isDisabled
}

public writeValue(value: any, internal?: boolean) {
  if (value) {
    if (Array.isArray(value)) {
      if (this.multiple) {
        this.value = value
      } else if (value.length > 0) {
        this.value = value[0]
      }
    } else {
      this.value = value
    }
    if (this.selectedItems.length === 0) {
      if (Array.isArray(value)) {
        this.selectedItems = value
      } else {
        this.selectedItems.push(value)
      }
      this.initDropdownValuesAndOptions()
    }
  } else {
    this.value = []
    if (!internal) {
      this.reset()
    }
  }
  if (!internal) {
    this.reset()
  }
}

public reset() {
  if (!this.config) {
    return
  }
  this.selectedItems = []
  this.availableItems = [...this.options.sort(this.config.customComparator)]
  this.initDropdownValuesAndOptions()
}

public setNotFoundState() {
  if (this.availableOptions?.length === 0 && this.selectedItems.length !== this.options.length) {
    this.showNotFound = true
  } else {
    this.showNotFound = false
  }
  this.cdref.detectChanges()
}

public ngOnChanges(changes: SimpleChanges) {
  if (!this.config) {
    return
  }
  this.selectedItems = []
  this.options = this.options || []

  if (changes['options']) {
    this.availableItems = [
      ...this.options.sort(this.config.customComparator),
    ]
  }
  if (changes['value']) {
    if (
      JSON.stringify(changes['value'].currentValue) === JSON.stringify([]) ||
      changes['value'].currentValue === "" ||
      changes['value'].currentValue === null
    ) {
      this.availableItems = [
        ...this.options.sort(this.config.customComparator),
      ]
    }
  }
  this.initDropdownValuesAndOptions()
}

/**
 * Deselct a selected items
 * @param item:  item to be deselected
 * @param index:  index of the item
 */
public deselectItem(item: any, index: number) {
  this.selectedItems.forEach((element: any, i: number) => {
    /* istanbul ignore else */
    if (item === element) {
      this.selectedItems.splice(i, 1)
    }
  })
  let sortedItems = [...this.availableItems]
  if (!this.availableItems.includes(item)) {
    this.availableItems.push(item)
    sortedItems = this.availableItems.sort(this.config.customComparator)
  }
  this.selectedItems = [...this.selectedItems]
  this.availableItems = [...sortedItems]
  if (!Array.isArray(this.value)) {
    this.value = []
  }
  if (!this.areAllSelected()) {
    this.selectAll = false
  }
  this.valueChanged()
  this.resetArrowKeyActiveElement()
}

/**
 * Select an item
 * @param item:  item to be selected
 * @param index:  index of the item
 */
public selectItem(item: string, index?: number) {
  if (!this.multiple) {
    if (this.selectedItems.length > 0) {
      this.availableItems.push(this.selectedItems[0])
    }
    this.selectedItems = []
    this.toggleDropdown = false
  }

  this.availableItems.forEach((element: any, i: number) => {
    if (item === element) {
      this.selectedItems.push(item)
      this.availableItems.splice(i, 1)
    }
  })

  if (this.config.clearOnSelection) {
    this.searchText = '' // null
  }

  this.selectedItems = [...this.selectedItems]
  this.availableItems = [...this.availableItems]
  this.selectedItems.sort(this.config.customComparator)
  this.availableItems.sort(this.config.customComparator)
  if (this.areAllSelected()) {
    this.selectAll = true
  }
  this.valueChanged()
  this.resetArrowKeyActiveElement()
}

public valueChanged() {
  this.writeValue(this.selectedItems, true)
  this.change.emit({ value: this.value })
  this.setSelectedDisplayText()
}

public openSelectDropdown() {
  this.toggleDropdown = true
  this.top = "30px"
  this.openStateChange()
  this.resetArrowKeyActiveElement()
  setTimeout(() => {
    const { visible, element } = this.isVisible()
    if (element) {
      this.top = visible
        ? "35px"
        : `-${element.getBoundingClientRect().height}px`
    }
  }, 3)
}

public closeSelectDropdown() {
  this.toggleDropdown = false
  this.openStateChange()
  this.resetArrowKeyActiveElement()
}

public openStateChange() {
  if (this.toggleDropdown) {
    this.dropdownService.openInstances.push(this.instanceId)
    this.open.emit()
  } else {
    this.searchText = ''
    this.optionMouseDown = false
    this.close.emit()
    this.dropdownService.openInstances.splice(
      this.dropdownService.openInstances.indexOf(this.instanceId),
      1
    )
  }
}

public searchTextChanged() {
  this.searchChange.emit(this.searchText)
}

public changeSearchText($event: any) {
  $event.stopPropagation()
}

  private initDropdownValuesAndOptions() {
    if (typeof this.config === "undefined" || Object.keys(this.config).length === 0) {
      this.config = { ...config }
    }

    for (const key of Object.keys(config)) {
      this.config[key] = this.config[key] ? this.config[key] : config[key]
    }
    this.config = { ...this.config }
    this.selectedDisplayText = this.config["placeholder"]
    if (this.value !== "" && typeof this.value !== "undefined") {
      if (Array.isArray(this.value)) {
        this.selectedItems = this.value
      } else if (this.value !== "" && this.value !== null) {
        this.selectedItems[0] = this.value
      } else {
        this.selectedItems = []
        this.value = []
      }

      this.selectedItems.forEach((item: any) => {
        const ind = this.availableItems.findIndex(
          (aItem: any) => JSON.stringify(item) === JSON.stringify(aItem)
        )
        if (ind !== -1) {
          this.availableItems.splice(ind, 1)
        }
      })
    }
    this.setSelectedDisplayText()
  }

  private setSelectedDisplayText() {
    let text: string = this.selectedItems[0]
    if (typeof this.selectedItems[0] === "object") {
      text = this.config.displayFn ? this.config.displayFn(this.selectedItems[0]) : this.selectedItems[0][this.config.displayKey]
    }
    if (this.multiple && this.selectedItems.length > 0) {
      this.selectedDisplayText = this.selectedItems.length === 1 ? text : text + ` + ${this.selectedItems.length - 1} ${this.config.moreText}`
    } else {
      this.selectedDisplayText = this.selectedItems.length === 0 ? this.config.placeholder : text
    }
  }


  private onArrowKeyUp() {
    if (this.focusedItemIndex === 0) {
      this.focusedItemIndex = this.availableItems.length - 1
      return
    }
    if (this.onArrowKey()) {
      this.focusedItemIndex--
    }
  }


  private onArrowKeyDown() {
    if (this.focusedItemIndex === this.availableItems.length - 1) {
      this.focusedItemIndex = 0
      return
    }
    if (this.onArrowKey()) {
      this.focusedItemIndex++
    }
  }

  private onArrowKey() {
    if (this.focusedItemIndex === null) {
      this.focusedItemIndex = 0
      return false
    }
    return true
  }

  private resetArrowKeyActiveElement() {
    this.focusedItemIndex = 0
  }

  public toggleSelectAll(close?: boolean, emitChange?: boolean): void {
    this.selectAll = !this.selectAll
    if (this.selectAll) {
      this.selectedItems = [...this.selectedItems, ...this.availableItems]
      this.availableItems = []
    } else {
      this.availableItems = [...this.selectedItems, ...this.availableItems]
      this.selectedItems = []
    }
    this.selectedItems.sort(this.config.customComparator)
    this.availableItems.sort(this.config.customComparator)
    this.valueChanged()
    this.closeSelectDropdown()
    this.openStateChange()
    this.resetArrowKeyActiveElement()
  }

  areAllSelected() {
    return this.selectedItems.length === this.options.length
  }
}
