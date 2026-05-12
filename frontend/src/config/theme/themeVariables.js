const primaryColor = '#EF8354';
const primaryHover = '#d9724a';
const secondaryColor = '#4F5D75';
const secondaryHover = '#2D3142';
const linkColor = '#EF8354';
const linkHover = '#d9724a';
const headingColor = '#2D3142';
const successColor = '#22C55E';
const successHover = '#16A34A';
const warningColor = '#F59E0B';
const warningHover = '#D97706';
const errorColor = '#EF4444';
const errorHover = '#DC2626';
const infoColor = '#3B82F6';
const infoHover = '#2563EB';
const darkColor = '#2D3142';
const darkHover = '#1a1d2b';
const grayColor = '#4F5D75';
const grayHover = '#2D3142';
const lightColor = '#BFC0C0';
const lightHover = '#E5E7EB';
const whiteColor = '#ffffff';
const dashColor = '#E5E7EB';
const whiteHover = '#4F5D75';
const extraLightColor = '#BFC0C0';
const dangerColor = '#EF4444';
const dangerHover = '#DC2626';
const borderColorLight = '#F3F4F6';
const borderColorNormal = '#E5E7EB';
const borderColorDeep = '#BFC0C0';
const bgGrayColorDeep = '#F3F4F6';
const bgGrayColorLight = '#F9FAFB';
const bgGrayColorNormal = '#F7F8FA';
const lightGrayColor = '#BFC0C0';
const sliderRailColor = 'rgba(45, 49, 66, 0.12)';
const graySolid = '#BFC0C0';
const pinkColor = '#EC4899';
const btnlg = '48px';
const btnsm = '36px';
const btnxs = '29px';

const theme = {
  'primary-color': primaryColor,
  'primary-hover': primaryHover,
  'secondary-color': secondaryColor,
  'secondary-hover': secondaryHover,
  'link-color': linkColor,
  'link-hover': linkHover,
  'success-color': successColor,
  'success-hover': successHover,
  'warning-color': warningColor,
  'warning-hover': warningHover,
  'error-color': errorColor,
  'error-hover': errorHover,
  'info-color': infoColor,
  'info-hover': infoHover,
  'dark-color': darkColor,
  'dark-hover': darkHover,
  'gray-color': grayColor,
  'gray-hover': grayHover,
  'light-color': lightColor,
  'light-hover': lightHover,
  'white-color': whiteColor,
  'white-hover': whiteHover,
  white: whiteColor,
  black: '#000',
  pink: pinkColor,
  'dash-color': dashColor,
  'extra-light-color': extraLightColor,
  'danger-color': dangerColor,
  'danger-hover': dangerHover,
  'font-family': "'Inter', sans-serif",
  'font-size-base': '14px',
  'heading-color': headingColor,
  'text-color': darkColor,
  'text-color-secondary': grayColor,
  'disabled-color': 'rgba(0, 0, 0, 0.25)',
  'border-radius-base': '6px',
  'border-color-base': '#E5E7EB',
  'box-shadow-base': '0 1px 3px rgba(0, 0, 0, 0.08)',
  'border-color-light': borderColorLight,
  'border-color-normal': borderColorNormal,
  'border-color-deep': borderColorDeep,
  'bg-color-light': bgGrayColorLight,
  'bg-color-normal': bgGrayColorNormal,
  'bg-color-deep': bgGrayColorDeep,
  'light-gray-color': lightGrayColor,
  'gray-solid': graySolid,
  'btn-height-large': btnlg,
  'btn-height-small': btnsm,
  'btn-height-extra-small': btnxs,
  'btn-default-color': darkColor,

  // cards
  'card-head-background': '#ffffff',
  'card-head-color': darkColor,
  'card-background': '#ffffff',
  'card-head-padding': '16px',
  'card-padding-base': '12px',
  'card-radius': '10px',
  'card-shadow': '0 1px 3px rgba(0, 0, 0, 0.04)',

  // Layout
  'layout-body-background': '#F7F8FA',
  'layout-header-background': '#ffffff',
  'layout-footer-background': '#ffffff',
  'layout-header-height': '64px',
  'layout-header-padding': '0 15px',
  'layout-footer-padding': '24px 15px',
  'layout-sider-background': '#ffffff',
  'layout-trigger-height': '48px',
  'layout-trigger-background': '#2D3142',
  'layout-trigger-color': '#fff',
  'layout-zero-trigger-width': '36px',
  'layout-zero-trigger-height': '42px',
  'layout-sider-background-light': '#fff',
  'layout-trigger-background-light': '#fff',
  'layout-trigger-color-light': 'rgba(0, 0, 0, 0.65)',

  // PageHeader
  'page-header-padding': '24px',
  'page-header-padding-vertical': '16px',
  'page-header-padding-breadcrumb': '12px',
  'page-header-back-color': '#000',
  'page-header-ghost-bg': 'inherit',

  // Popover
  'popover-color': darkColor,

  // alert
  'alert-success-border-color': successColor,
  'alert-success-bg-color': successColor + 15,
  'alert-error-bg-color': errorColor + 15,
  'alert-warning-bg-color': warningColor + 15,
  'alert-info-bg-color': infoColor + 15,

  // radio btn
  'radio-button-checked-bg': primaryColor,

  // gutter width
  'grid-gutter-width': 25,

  // skeleton
  'skeleton-color': borderColorLight,

  // slider
  'slider-rail-background-color': sliderRailColor,
  'slider-rail-background-color-hover': sliderRailColor,
  'slider-track-background-color': primaryColor,
  'slider-track-background-color-hover': primaryColor,
  'slider-handle-color': primaryColor,
  'slider-handle-size': '16px',

  // input
  'input-height-base': '48px',
  'input-border-color': borderColorNormal,
  'input-height-sm': '30px',
  'input-height-lg': '50px',

  // rate
  'rate-star-color': warningColor,
  'rate-star-size': '13px',

  // Switch
  'switch-min-width': '35px',
  'switch-sm-min-width': '30px',
  'switch-height': '18px',
  'switch-sm-height': '15px',

  // result
  'result-title-font-size': '20px',
  'result-subtitle-font-size': '12px',
  'result-icon-font-size': '50px',

  // tabs
  'tabs-horizontal-padding': '12px 15px',
  'tabs-horizontal-margin': '0',

  // list
  'list-item-padding': '10px 24px',

  // Tags
  'tag-default-bg': '#F3F4F6',
  'tag-default-color': darkColor,
  'tag-font-size': '11px',
};

const darkTheme = {
  ...theme,
  'primary-color': '#E5E7EB',
  backgroundColor: '#111827',
};

export { theme, darkTheme };
