import { createGlobalStyle } from 'styled-components';

const ModernModalStyles = createGlobalStyle`
  .modern-modal {
    .ant-modal-content {
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06) !important;
    }

    .ant-modal-header {
      background: linear-gradient(135deg, #2D3142 0%, #4F5D75 100%) !important;
      border-bottom: none !important;
      padding: 20px 24px !important;
    }

    .ant-modal-title {
      color: #ffffff !important;
      font-size: 18px !important;
      font-weight: 700 !important;
      letter-spacing: -0.01em;
    }

    .ant-modal-close {
      color: rgba(255, 255, 255, 0.65) !important;
      &:hover {
        color: #ffffff !important;
      }
    }

    .ant-modal-body {
      padding: 16px 24px !important;
    }

    .ant-modal-footer {
      border-top: 1px solid #E5E7EB !important;
      padding: 14px 24px !important;
      background: #F9FAFB !important;
    }

    .ant-form-item-label > label {
      font-weight: 600;
      color: #374151;
      font-size: 13px;
    }

    .ant-input,
    .ant-input-number,
    .ant-picker,
    .ant-input-affix-wrapper {
      border-radius: 8px !important;
      border-color: #D1D5DB !important;
      &:hover {
        border-color: #9CA3AF !important;
      }
      &:focus,
      &-focused {
        border-color: #EF8354 !important;
        box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
      }
    }

    textarea.ant-input {
      border-radius: 8px !important;
    }

    .ant-select-selector {
      border-radius: 8px !important;
      border-color: #D1D5DB !important;
      &:hover {
        border-color: #9CA3AF !important;
      }
    }

    .ant-select-focused .ant-select-selector {
      border-color: #EF8354 !important;
      box-shadow: 0 0 0 2px rgba(239, 131, 84, 0.12) !important;
    }
  }
`;

export default ModernModalStyles;
