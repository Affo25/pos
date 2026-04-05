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
  background: #eceff3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const AidLoginCard = Styled.div`
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 4px 24px rgba(15, 23, 42, 0.06),
    0 12px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
`;

const AidLoginCardTop = Styled.div`
  height: 96px;
  background: linear-gradient(125deg, #e8ecff 0%, #f0e8ff 42%, #e8f4ff 100%);
  position: relative;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.12) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.85;
  }
`;

const AidLoginCardBody = Styled.div`
  padding: 28px 40px 36px;
  @media (max-width: 480px) {
    padding: 22px 20px 28px;
  }
  .aid-brand-name {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin: 0 0 4px;
    letter-spacing: -0.02em;
  }
  .aid-welcome-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin: 0 0 8px;
    line-height: 1.25;
  }
  .aid-welcome-sub {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
    margin: 0 0 26px;
    line-height: 1.5;
  }
  .aid-logo-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    img {
      max-height: 52px;
      width: auto;
      object-fit: contain;
    }
  }
  .ant-form-item-label > label {
    color: #6b7280 !important;
    font-size: 13px !important;
    font-weight: 500;
  }
  .ant-input,
  .ant-input-affix-wrapper {
    border-radius: 8px !important;
  }
  .ant-input-affix-wrapper {
    padding: 8px 12px !important;
  }
  .aid-signin-submit.ant-btn {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    border: none;
    background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  .aid-signin-submit.ant-btn:hover,
  .aid-signin-submit.ant-btn:focus {
    background: linear-gradient(180deg, #3a3a3a 0%, #222 100%);
    color: #fff;
  }
`;

export { Aside, Content, AuthWrapper, AidLoginPage, AidLoginCard, AidLoginCardTop, AidLoginCardBody };
