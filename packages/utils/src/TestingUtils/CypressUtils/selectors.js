export const ouiaId = (id) => `[data-ouia-component-id="${id}"]`;

/** PF6 OUIA */
export const BUTTON = '[data-ouia-component-type="PF6/Button"]';
export const DROPDOWN = '[data-ouia-component-type="PF6/Dropdown"]';
export const DROPDOWN_TOGGLE = '[data-ouia-component-type="PF6/DropdownToggle"]';
export const DROPDOWN_ITEM = '[data-ouia-component-type="PF6/DropdownItem"]';
export const CHIP = '[data-ouia-component-type="PF6/Chip"]';
export const CHIP_GROUP = 'div[data-ouia-component-type="PF6/ChipGroup"]';
export const MENU = '[data-ouia-component-type="PF6/Menu"]';
export const MENU_TOGGLE_CHECKBOX = '[data-ouia-component-type="PF6/MenuToggleCheckbox"]';
export const MODAL_CONTENT = '[data-ouia-component-type="PF6/ModalContent"]';
export const CHECKBOX = '[data-ouia-component-type="PF6/Checkbox"]';
export const TITLE = '[data-ouia-component-type="PF6/Title"]';
export const PAGINATION = '[data-ouia-component-type="PF6/Pagination"]';
export const TEXT_INPUT = '[data-ouia-component-type="PF6/TextInput"]';
export const TOOLBAR = '[data-ouia-component-type="PF6/Toolbar"]';
export const TABLE = '[data-ouia-component-type="PF6/Table"]';
export const TABLE_HEADER = 'thead [data-ouia-component-type="PF6/TableRow"]';
export const TABLE_ROW = 'tbody [data-ouia-component-type="PF6/TableRow"]';
export const TABLE_ROW_CHECKBOX = 'tbody [data-ouia-component-type="PF6/TableRow"] input';
export const EMPTY_STATE = '[data-ouia-component-type="PF6/EmptyState"]';
export const CARD = '[data-ouia-component-type="PF6/Card"]';
export const BREADCRUMB = '[data-ouia-component-type="PF6/Breadcrumb"]';
export const TAB_CONTENT = '[data-ouia-component-type="PF6/TabContent"]';
export const TAB_BUTTON = '[data-ouia-component-type="PF6/TabButton"]';
export const ALERT = '[data-ouia-component-type="PF6/Alert"]';

/** PF6 classes */
export const MENU_TOGGLE = '.pf-v6-c-menu-toggle';
export const MENU_LIST = '.pf-v6-c-menu__list';
export const MENU_TOGGLE_TEXT = '.pf-v6-c-menu-toggle__text';
export const MENU_ITEM = '.pf-v6-c-menu__list-item';
export const SELECT_MENU_ITEM = '.pf-v6-c-select__menu-item';
export const PAGINATION_TOP = `${PAGINATION}:not(.pf-m-bottom)`;
export const PAGINATION_BOTTOM = `${PAGINATION}.pf-m-bottom`;
export const EMPTY_STATE_TITLE = '.pf-v6-c-empty-state__title';
export const EMPTY_STATE_ICON = '.pf-v6-c-empty-state__icon';
export const CARD_TITLE = '.pf-v6-c-card__title';

/** PF5 aria */
export const PAGINATION_NEXT = 'button[aria-label="Go to next page"]';
export const PAGINATION_PREV = 'button[aria-label="Go to previous page"]';
export const PAGINATION_LAST = 'button[aria-label="Go to last page"]';
export const PAGINATION_FIRST = 'button[aria-label="Go to first page"]';
export const PAGINATION_CURRENT = '[aria-label="Current page"]';

/** PrimaryToolbar OUIA */
export const PRIMARY_TOOLBAR = '[data-ouia-component-id="PrimaryToolbar"]';
export const PRIMARY_TOOLBAR_ACTIONS = '.ins-c-primary-toolbar__actions';
export const CONDITIONAL_FILTER = '[data-ouia-component-id="ConditionalFilter"]';
export const CONDITIONAL_FILTER_TOGGLE = '[data-ouia-component-id="ConditionalFilterToggle"]';
export const PT_CONDITIONAL_FILTER = '[data-ouia-component-id="ConditionalFilter"]';
export const PT_CONDITIONAL_FILTER_TOGGLE = '[data-ouia-component-id="ConditionalFilterToggle"]';
export const PT_CONDITIONAL_FILTER_LIST = '[data-ouia-component-id="ConditionalFilterList"]';
export const PT_BULK_SELECT = '[data-ouia-component-id="BulkSelect"]';
export const PT_BULK_SELECT_CHECKBOX = '[data-ouia-component-id="BulkSelectCheckbox"]';
export const PT_BULK_SELECT_LIST = '[data-ouia-component-id="BulkSelectList"]';
export const PT_BULK_ACTIONS_TOGGLE = '[data-ouia-component-id="BulkActionsToggle"]';
export const PT_BULK_ACTIONS_LIST = '[data-ouia-component-id="BulkActionsList"]';
