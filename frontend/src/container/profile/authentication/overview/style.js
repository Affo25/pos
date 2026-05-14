import Styled from 'styled-components';

const Aside = Styled.aside`
  width: 100%;
  height: 100vh;
  position: relative;
  background-image: url("${require('../../../../static/img/auth/BG.png')}");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: left top;
  @media only screen and (max-width: 767px){
    height: 100%;
  }
  .topShape {
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
  }
  .bottomShape {
    position: absolute;
    bottom: 0;
    left: 0;
    //width: 400px;
  }
  .auth-side-content{
    @media only screen and (max-width: 991px){
      h1{
        font-size: 20px;
      }
    }
    @media only screen and (max-width: 767px){
      h1{
        font-size: 24px;
        margin-bottom: 28px;
      }
    }
  }
`;

const Content = Styled.div`
    padding: 100px;
    @media only screen and (max-width: 1599px){
      padding: 50px;
    }
    @media only screen and (max-width: 991px){
      padding: 20px;
    }
    @media only screen and (max-width: 767px){
      text-align: center;
    }
    .auth-content-figure{
      @media only screen and (max-width: 1199px){
        max-width: 420px;
      }
      @media only screen and (max-width: 991px){
        max-width: 100%;
      }
    }
`;

const AuthWrapper = Styled.div`
  height: 100%;
  padding: 40px;
  @media only screen and (max-width: 1599px){
    padding: 25px;
  }

  @media only screen and (max-width: 767px){
    text-align: center;
  }
  .auth-notice{
    text-align: right;
    font-weight: 500;
    color: ${({ theme }) => theme['gray-color']};
    @media only screen and (max-width: 767px){
      text-align: center;
      margin-bottom: 10px;
    }
  }
  button{
    &.btn-signin{
      min-width: 185px;
    }
    &.btn-create{
      border-radius: 8px;
      min-width: 205px;
    }
    &.btn-reset{
      border-radius: 8px;
      min-width: 260px;
    }
    &.ant-btn-lg{
      font-size: 14px;
      font-weight: 500;
      height: 48px;
    }
  }
  .auth-contents{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    form{
      width: 420px;
      h1{
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 45px;
        @media only screen and (max-width: 767px){
          margin-bottom: 28px;
        }
        input::placeholder{
          color: ${({ theme }) => theme['extra-light-color']};
        }
      }
      .auth-form-action{
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        @media only screen and (max-width: 379px){
          flex-flow: column;
          .forgot-pass-link{
            margin-top: 15px;
          }
        }
      }
    }
    #forgotPass{
      .forgot-text{
        margin-bottom: 25px;
      }
      .return-text{
        margin-top: 35px;
      }
    }
    .form-divider{
      font-size: 13px;
      color: ${({ theme }) => theme['gray-solid']};
      text-align: center;
      position: relative;
      margin-bottom: 25px;
      &:before{
        content: '';
        position: absolute;
        width: 100%;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        height: 1px;
        background: ${({ theme }) => theme['border-color-light']};
      }
      span{
        background: #fff;
        padding: 0 15px;
        display: inline-block;
        position: relative;
        z-index: 2;
      }
    }
    .social-login{
      display: flex;
      align-items: center;
      margin: -6px -6px 14px -6px;
      @media only screen and (max-width: 767px){
        justify-content: center;
      }
      &.signin-social{
        li{
          a{
            box-shadow: 0 5px 15px ${({ theme }) => theme['light-color']}10;
            background-color: #fff;
          }
        }
      }
      li{
        padding:6px;
        a{
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          height: 48px;
          padding: 0 15px;
          background: ${({ theme }) => theme['bg-color-light']};
          color: ${({ theme }) => theme['text-color']};
          font-weight: 500;
          @media only screen and (max-width: 379px){
            height: 44px;
            padding: 0 12px;
          }
          span:not(.anticon){
            display: inline-block;
            margin-left: 5px;
          }
          svg,
          i{
            width: 20px;
            height: 20px;
          }
          &.google-signup,
          &.google-signin{
            display: flex;
            align-items: center;
            padding: 0 30px;
            @media only screen and (max-width: 379px){
              padding: 0 5px;
            }
            img{
              margin-right: 8px;
              @media only screen and (max-width: 379px){
                margin-right: 4px;
              }
            }
          }
          &.facebook-sign{
            color: #475993;
          }
          &.twitter-sign{
            color: #03A9F4;
          }
        }
      }
    }
    .auth0-login{
      margin: -6px;
      display: flex;
      flex-wrap: wrap;
      a{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          height: 48px;
          padding: 0 30px;
          background: ${({ theme }) => theme['bg-color-light']};
          color: ${({ theme }) => theme['text-color']};
          font-weight: 500;
          border: 0 none;
          border-radius: 5px;
          margin: 6px;
          flex: 1;
          @media (max-width:480px){
            flex: none;
            width: 100%;
          }
      }
    }
  }
  .auth0-login{
      margin: -6px;
      display: flex;
      flex-wrap: wrap;
      a{
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          height: 48px;
          padding: 0 30px;
          background: ${({ theme }) => theme['bg-color-light']};
          color: ${({ theme }) => theme['text-color']};
          font-weight: 500;
          border: 0 none;
          border-radius: 5px;
          margin: 6px;
          flex: 1;
          @media (max-width:480px){
            flex: none;
            width: 100%;
          }
      }
    }
  }
`;

const AidLoginPage = Styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(ellipse 80% 60% at 10% 90%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 90% 10%, rgba(59, 130, 246, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 50%),
    linear-gradient(160deg, #f8f9fc 0%, #f0f2f7 30%, #e8ecf4 60%, #f5f6fa 100%);

  &::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -150px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -180px;
    left: -120px;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .aid-page-logo {
    position: absolute;
    top: 28px;
    left: 32px;
    z-index: 10;
    img {
      height: 72px;
      width: auto;
      max-width: min(280px, 42vw);
      object-fit: contain;
      display: block;
    }
    @media (max-width: 480px) {
      top: 18px;
      left: 18px;
      img {
        height: 52px;
        max-width: 55vw;
      }
    }
  }
`;

const AidLoginCard = Styled.div`
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const AidLoginCardTop = Styled.div`
  display: none;
`;

const AidLoginCardBody = Styled.div`
  padding: 32px 32px 36px;
  @media (max-width: 480px) {
    padding: 24px 20px 28px;
  }
  .aid-brand-name {
    display: none;
  }
  .aid-welcome-title {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    text-align: left;
    margin: 0 0 4px;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }
  .aid-welcome-sub {
    font-size: 14px;
    color: #9CA3AF;
    text-align: left;
    margin: 0 0 24px;
    line-height: 1.5;
  }
  .aid-logo-wrap {
    display: none;
  }
  .ant-form-item {
    margin-bottom: 18px !important;
  }
  .ant-form-item-label > label {
    color: #4B5563 !important;
    font-size: 13px !important;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  /* Shared field chrome (email + password wrapper) */
  .ant-input,
  .ant-input-affix-wrapper {
    border-radius: 10px !important;
    border-color: #E5E7EB !important;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-size: 14px !important;
    &:hover {
      border-color: #D1D5DB !important;
    }
  }
  .ant-input:focus,
  .ant-input-affix-wrapper-focused {
    border-color: #EF8354 !important;
    box-shadow: 0 0 0 3px rgba(239, 131, 84, 0.12) !important;
  }

  /* Email: single-line input */
  .ant-form-item-control-input-content > .ant-input:not(.ant-input-affix-wrapper .ant-input) {
    padding: 10px 12px !important;
    min-height: 44px;
    line-height: 1.5;
  }

  /* Password: same outer size as email; border lives on affix wrapper */
  .ant-input-affix-wrapper {
    padding: 10px 12px !important;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .ant-input-affix-wrapper .ant-input {
    padding: 0 !important;
    min-height: 0 !important;
    height: auto !important;
    line-height: 1.5;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  .ant-input-affix-wrapper .ant-input:focus {
    box-shadow: none !important;
  }
  .ant-input-affix-wrapper .ant-input-suffix {
    margin-left: 8px;
    display: flex;
    align-items: center;
    color: #9ca3af;
  }
  .ant-input-affix-wrapper .ant-input-suffix .anticon {
    font-size: 16px;
  }
  .aid-signin-submit.ant-btn {
    width: 100%;
    height: 44px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    border: none;
    background: #2D3142;
    color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: background 0.2s, transform 0.15s;
    margin-top: 4px;
  }
  .aid-signin-submit.ant-btn:hover,
  .aid-signin-submit.ant-btn:focus {
    background: #4F5D75;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  .aid-signin-submit.ant-btn:active {
    transform: translateY(0);
  }
`;

export { Aside, Content, AuthWrapper, AidLoginPage, AidLoginCard, AidLoginCardTop, AidLoginCardBody };
