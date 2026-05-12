import Styled from 'styled-components';

const Div = Styled.div`
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    ${({ darkMode }) =>
      darkMode
        ? `
        background: #111827;
    `
        : `
        background: #F7F8FA;
    `}

    .layout.ant-layout{
        min-height: 100vh;
        background: transparent !important;
    }
    .layout > .ant-layout{
        flex: 1 1 auto;
        min-height: calc(100vh - 64px);
        align-items: stretch;
        background: transparent !important;
    }
    .atbd-main-layout.ant-layout{
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 64px) !important;
        width: 100%;
        max-width: 100%;
        background: transparent !important;
    }

    .ant-menu-submenu-title {
        .ant-menu-item-icon + span {
            margin-left: 20px;
        }
    }
    header{
        box-shadow: 0 1px 0 ${({ darkMode }) => darkMode ? 'rgba(255,255,255,0.06)' : '#E5E7EB'};
        ${({ darkMode }) => (darkMode ? `background: #1F2937;` : '')};
        z-index: 999;

        @media print {
            display: none;
        }

        .ant-btn-link{
            ${({ darkMode }) =>
              darkMode ? `background: #1F2937;border-color: #374151;color: #9CA3AF !important` : ''};
        }

        .head-example{
            ${({ darkMode }) => (darkMode ? `color: #9CA3AF;` : '')};
        }
        .ant-menu-sub.ant-menu-vertical{
            .ant-menu-item{
                a{
                    color: ${({ theme }) => theme['gray-color']};
                }
            }
        }
        .ant-menu.ant-menu-horizontal{
            display: flex;
            align-items: center;
            margin: 0 -16px;
            li.ant-menu-submenu{
                margin: 0 16px;
            }
            .ant-menu-submenu{
                &.ant-menu-submenu-active,
                &.ant-menu-submenu-selected,
                &.ant-menu-submenu-open{
                    .ant-menu-submenu-title{
                        color: ${({ darkMode }) => (darkMode ? `#fff;` : '#2D3142')};
                        svg,
                        i{
                            color: ${({ darkMode }) => (darkMode ? `#fff;` : '#2D3142')};
                        }
                    }
                }
                .ant-menu-submenu-title{
                    font-size: 14px;
                    font-weight: 500;
                    color: ${({ darkMode }) => (darkMode ? `#ffffff90;` : '#6B7280')};
                    svg,
                    i{
                        color: ${({ darkMode }) => (darkMode ? `#ffffff90;` : '#6B7280')};
                    }
                    .ant-menu-submenu-arrow{
                        font-family: "FontAwesome";
                        font-style: normal;
                        ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 6px;
                        &:after{
                            color: ${({ darkMode }) => (darkMode ? `#ffffff90;` : '#9CA3AF')};
                            content: '\f107';
                            background-color: transparent;
                        }
                    }
                }
            }
        }

    }
    .header-more{
        .head-example{
            ${({ darkMode }) => (darkMode ? `color: #9CA3AF;` : '')};
        }
    }
    .customizer-trigger{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        border-radius: ${({ theme }) => (theme.rtl ? '0 10px 10px 0' : '10px 0 0 10px')};
        background-color: #2D3142;
        position: fixed;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
        top: 50%;
        transform: translateY(-50%);
        transition: all .3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        &.show{
            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 295px;
        }
        @media print {
            display: none;
        }
        svg,
        img{
            width: 20px;
            color: #fff;
            animation: antRotate 3s infinite linear;
        }
    }
    .customizer-wrapper{
        position: fixed;
        top: 0;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
        width: 350px;
        transform: translateX(${({ theme }) => (theme.rtl ? '-350px' : '350px')});
        height: 100vh;
        overflow-y: auto;
        background-color: #fff;
        box-shadow: -4px 0 24px rgba(0,0,0,0.06);
        z-index: 99999999999;
        transition: all .3s ease;
        @media only screen and (max-width: 479px){
            width: 280px;
            transform: translateX(${({ theme }) => (theme.rtl ? '-280px' : '280px')});
        }
        &.show{
            transform: translateX(0);
        }
    }
    .customizer{
        height: 100%;
        .customizer__head{
            position: relative;
            padding: 18px 24px;
            border-bottom: 1px solid #F3F4F6;
            text-align: left;
            .customizer-close{
                position: absolute;
                right: 15px;
                top: 15px;
                svg,
                i{
                    color: #EF4444;
                }
            }
            .customizer__title{
                font-weight: 600;
                color: #2D3142;
                font-size: 16px;
                margin-bottom: 2px;
            }
        }
        .customizer__body{
            padding: 25px;
        }
        .customizer__single{
            &:not(:last-child){
                margin-bottom: 35px;
            }
            h4{
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 10px;
                color: #2D3142;
            }
        }
    }
    .customizer-list{
        margin: -10px;
        .customizer-list__item{
            position: relative;
            display: inline-block;
            min-height: 60px;
            background-size: cover;
            margin: 10px;
            &.top{
                span.fa{
                    top: 35px;
                }
            }
            &:hover{
                span{
                    color: #2D3142;
                }
            }
            a{
                position: relative;
                display: block;
                &.active{
                    span.fa{
                        display: block;
                    }
                }
                span.fa{
                    display: none;
                    font-size: 16px;
                    margin-top: 0;
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    color: ${({ theme }) => theme['success-color']};
                }
            }
            img{
                width: 100%;
            }
            span{
                display: inline-block;
                margin-top: 15px;
                color: #2D3142;
            }
        }
    }
    .striking-logo{
        @media only screen and (max-width: 875px){
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 4px;
        }
        @media only screen and (max-width: 767px){
            ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0;
        }
        img{
            max-width: ${({ theme }) => (theme.topMenu ? '140px' : '120px')};
            width: 100%;
        }
        &.top-menu{
            ${({ theme }) => (theme.rtl ? 'margin-right' : 'margin-left')}: 15px;
        }
    }
    .certain-category-search-wrapper{
        ${({ darkMode, theme }) =>
          darkMode ? `${!theme.rtl ? 'border-right' : 'border-left'}: 1px solid #374151;` : ''};
         @media only screen and (max-width: 767px){
            padding: 0 15px;
        }
        input{
            max-width: 350px;
            ${({ darkMode }) => (darkMode ? `background: #1F2937;` : '')};
            ${({ darkMode }) => (darkMode ? `color: #fff;` : 'color: #6B7280')};
            @media only screen and (max-width: 875px){
                ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 5px;
            }
        }
    }
    
    .navbar-brand{
        button{
            padding: ${({ theme }) => (theme.rtl ? '0 15px 0 25px' : '0 25px 0 15px')};
            line-height: 0;
            margin-top: 4px;
            color: ${({ theme }) => theme['extra-light-color']};
            @media only screen and (max-width: 875px){
                padding: ${({ theme }) => (theme.rtl ? '0 10px 0 25px' : '0 25px 0 10px')};
            }
            @media only screen and (max-width: 767px){
                padding: ${({ theme }) => (theme.rtl ? '0 0px 0 15px' : '0 15px 0 0px')};
            }
        }
    }

    /* Sidebar */
    .ant-layout-sider{
        box-shadow: none;
        transition: background 0.25s ease, box-shadow 0.25s ease;
        @media (max-width: 991px){
            box-shadow: none;
        }
        @media print {
            display: none;
        }

        &.ant-layout-sider-light{
            background: #ffffff !important;
            ${({ theme }) => (!theme.rtl ? 'border-right' : 'border-left')}: 1px solid #E5E7EB;
        }

        &.ant-layout-sider-dark{
            background: #111827 !important;
            ${({ theme }) => (!theme.rtl ? 'border-right' : 'border-left')}: 1px solid rgba(255, 255, 255, 0.08);
            .ant-layout-sider-children{
                .ant-menu{
                    .ant-menu-submenu-inline{
                        > .ant-menu-submenu-title{
                            padding: 0 30px !important;
                        }
                    }
                    .ant-menu-item{
                        padding: 0 30px !important;
                    }
                }
            }
        }
        
        .ant-layout-sider-children{
            min-height: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding-bottom: 15px;
            >.sidebar-nav-title{
                margin-top: 8px;
            }

            .ant-menu{
                overflow-x: hidden;
                font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                line-height: 1.5;
                -webkit-font-smoothing: antialiased;
                .ant-menu-sub.ant-menu-inline{
                    background-color: #fff;
                }
                ${({ theme }) => (theme.rtl ? 'border-left' : 'border-right')}: 0 none;
                .ant-menu-submenu, .ant-menu-item{
                    .feather,
                    img{
                        width: 16px;
                        font-size: 16px;
                        color: #9CA3AF;
                    }
                    span{
                        display: inline-block;
                        color: #4B5563;
                        transition: 0.3s ease;
                        a{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 10px;
                        }
                    }
                    .sDash_menu-item-icon{
                        line-height: .6;
                    }
                }
                .ant-menu-submenu{
                    span.ant-menu-title-content{
                        margin: 0;
                        ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 20px;
                    }
                    .ant-menu-sub .ant-menu-item{
                        span.ant-menu-title-content{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 0;
                        }
                    }
                }
                .ant-menu-item{
                    .menuItem-iocn{
                        width: auto;
                    }
                }
                .ant-menu-item,
                .ant-menu-submenu-title{
                    a{
                        position: relative;
                    }
                    >span{
                        width: 100%;
                        .pl-0{
                            ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 0px;
                        }
                    }
                    .badge{
                        position: absolute;                        
                        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 30px;
                        top: 50%;
                        transform: translateY(-50%);
                        display: inline-block;
                        height: auto;
                        font-size: 10px;
                        border-radius: 3px;
                        padding: 3px 4px 4px;
                        line-height: 1;
                        letter-spacing: 1px;
                        color: #fff;
                        &.badge-primary{
                            background-color: ${({ theme }) => theme['primary-color']};
                        }
                        &.badge-success{
                            background-color: ${({ theme }) => theme['success-color']};
                        }
                    }
                }
                .ant-menu-submenu{
                    .ant-menu-submenu-title{
                        display: flex;
                        align-items: center;
                        .title{
                            padding-left: 0;
                        }
                        .badge{
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 45px;
                        }
                    }
                }
                .ant-menu-submenu-inline{
                    > .ant-menu-submenu-title{
                        display: flex;
                        align-items: center;
                        padding: 0 15px !important;
                        svg,
                        img{
                            width: 16px;
                            height: 16px;
                        }
                                                
                        .ant-menu-submenu-arrow{
                            right: auto;
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 24px;
                            &:after,
                            &:before{
                                width: 7px;
                                background: #9CA3AF;
                                height: 1.25px;
                            }
                            &:before{
                                transform: rotate(45deg) ${({ theme }) =>
                                  !theme.rtl ? 'translateY(-3.3px)' : 'translateY(3.3px)'};
                            }
                            &:after{
                                transform: rotate(-45deg) ${({ theme }) =>
                                  theme.rtl ? 'translateY(-3.3px)' : 'translateY(3.3px)'};
                            }
                        }
                    }
                    &.ant-menu-submenu-open{
                        > .ant-menu-submenu-title{
                            .ant-menu-submenu-arrow{
                                transform: translateY(2px);
                                &:before{
                                    transform: rotate(45deg) translateX(-3.3px);
                                }
                                &:after{
                                    transform: rotate(-45deg) translateX(3.3px);
                                }
                            }
                        }
                    }
                    .ant-menu-item{
                        ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 0px !important;
                        ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 0 !important;
                        transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
                        a{
                            ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 50px !important;
                        }
                    }
                }
                .ant-menu-item{
                    display: flex;
                    align-items: center;
                    padding: 0 15px !important;
                    &.ant-menu-item-active{
                        border-radius: 8px;
                        ${({ darkMode }) => (darkMode ? `background-color: rgba(255, 255, 255, .05);` : 'background-color: #F3F4F6;')};
                    }
                    a{
                        width: 100%;
                        display: flex !important;
                        align-items: center;
                        .feather{
                            width: 16px;
                            color: #9CA3AF;
                        }
                        span{
                            ${({ theme }) => (!theme.rtl ? 'padding-left' : 'padding-right')}: 20px;
                            display: inline-block;
                            color: #4B5563;
                        }
                    }
                    &.ant-menu-item-selected{
                        svg,
                        i{
                            color: #ffffff;
                        }
                    }
                }
                .ant-menu-submenu,
                .ant-menu-item{
                    ${({ theme }) => theme.rtl && `padding-right: 5px;`}
                    
                    &.ant-menu-item-selected{
                        border-radius: 8px;
                        &:after{
                            content: none;
                        }
                    }
                    &.ant-menu-submenu-active{
                        border-radius: 8px;
                        ${({ darkMode }) => (darkMode ? `background-color: rgba(255, 255, 255, .05);` : 'background-color: #F3F4F6;')};
                    }
                }
                .sidebar-nav-title{
                    margin-top: 40px;
                    margin-bottom: 24px;
                }
                &.ant-menu-inline-collapsed{
                    .ant-menu-submenu{
                        text-align: ${({ theme }) => (!theme.rtl ? 'left' : 'right')};                        
                        .ant-menu-submenu-title{
                            padding: 0 20px;
                            justify-content: center;
                        }
                    }
                    .ant-menu-item{
                        padding: 0 20px !important;
                        justify-content: center;
                    }
                    .ant-menu-submenu, .ant-menu-item{
                        span{
                            display: none;
                        }
                    }
                }
            }
        }
        .sidebar-nav-title{
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            align-items: center;
            gap: 10px;
            ${({ darkMode }) =>
              darkMode
                ? `color: rgba(156, 163, 175, 0.85);`
                : `color: #9CA3AF;`};
            padding: 0 ${({ theme }) => (theme.rtl ? '20px' : '15px')};
            display: flex;
            .sidebar-nav-title__accent{
                display: none;
            }
        }
        &.ant-layout-sider-collapsed{
            padding: 15px 0px 55px !important;
            .sidebar-nav-title{
                display: none;
            }
            .sidebar-brand{
                display: none;
            }
            & + .atbd-main-layout{
                ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 80px;
            }
            .ant-menu-item{
                color: #333;
                .badge{
                    display: none;
                }
            }
        }

        /* Light sidebar: clean menu with dark active pill */
        &.ant-layout-sider-light .ant-layout-sider-children .ant-menu.ant-menu-light{
            background: transparent !important;
            border: none !important;
            padding: 6px 8px 16px;
            font-size: 14px;
            .ant-menu-item,
            .ant-menu-submenu > .ant-menu-submenu-title{
                margin: 2px 4px !important;
                border-radius: 8px !important;
                width: auto !important;
                font-size: 14px;
            }
            .ant-menu-item::after{
                display: none !important;
            }
            .ant-menu-item-selected{
                background: #2D3142 !important;
                box-shadow: none !important;
            }
            .ant-menu-item-selected .ant-menu-title-content,
            .ant-menu-item-selected a{
                color: #ffffff !important;
                font-weight: 600;
            }
            .ant-menu-item-selected .feather,
            .ant-menu-item-selected svg{
                color: #ffffff !important;
            }
            .ant-menu-submenu-open > .ant-menu-submenu-title{
                color: #2D3142 !important;
            }
            .ant-menu-sub.ant-menu-inline{
                background: #F9FAFB !important;
                border-radius: 8px;
                margin: 4px 0 8px;
                padding: 4px 0;
                box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.04);
            }
        }

        /* Dark sidebar */
        &.ant-layout-sider-dark .ant-layout-sider-children .ant-menu.ant-menu-dark{
            background: transparent !important;
            padding: 6px 8px 16px;
            .ant-menu-item,
            .ant-menu-submenu > .ant-menu-submenu-title{
                margin: 2px 4px !important;
                border-radius: 8px !important;
            }
            .ant-menu-item-selected{
                background: rgba(255, 255, 255, 0.12) !important;
                box-shadow: none;
            }
            .ant-menu-sub.ant-menu-inline{
                background: rgba(255, 255, 255, 0.04) !important;
                border-radius: 8px;
            }
        }
    }
    @media only screen and (max-width: 1150px){
        .ant-layout-sider.ant-layout-sider-collapsed{
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -80px !important;
        }

    }

    .atbd-main-layout{
        ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: ${({ theme }) =>
  theme.topMenu ? 0 : '280px'};
        margin-top: 64px;
        transition: 0.3s ease;
        @media only screen and (max-width: 1150px){
            ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: auto !important;
        }
        @media print {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
        }
    }

    /* Main content area */
    .app-shell-content.ant-layout-content{
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        width: 100%;
        height: calc(100vh - 64px);
        max-height: calc(100vh - 64px);
        min-height: 0;
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none;
        overflow: hidden;
    }

    .app-shell-main-scroll{
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
    }

    .app-shell-content .admin-footer{
        flex-shrink: 0;
        margin-top: 0;
    }

    @media print {
        .app-shell-content.ant-layout-content {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
        }
        .app-shell-main-scroll {
            overflow: visible !important;
        }
    }

    .admin-sider-scrollbars{
        flex: 1 1 auto;
        min-height: 0;
    }

    /* Header */
    .ant-layout-header.admin-shell-header {
        background: #ffffff !important;
        border-bottom: 1px solid #E5E7EB;
        box-shadow: none !important;
        padding: 0 20px !important;
        height: 64px !important;
        line-height: 64px !important;
    }
    .admin-shell-header .certain-category-search-wrapper {
        display: none !important;
    }
    .admin-shell-header .navbar-brand .striking-logo img {
        display: none !important;
    }
    .admin-shell-header .navbar-brand {
        display: flex;
        align-items: center;
        min-height: 64px;
    }

    .shell-header-bar {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 20px !important;
        padding: 0 !important;
        flex-wrap: nowrap;
        width: 100%;
    }
    .shell-clock {
        font-family: ui-monospace, 'JetBrains Mono', monospace;
        font-size: 13px;
        font-weight: 500;
        color: #9CA3AF;
        letter-spacing: 0.02em;
        min-width: 72px;
        text-align: right;
    }
    .shell-user-block {
        display: inline-flex !important;
        align-items: center;
        gap: 12px;
        border: none !important;
        background: transparent !important;
        cursor: pointer;
        padding: 6px 10px !important;
        border-radius: 8px;
        box-shadow: none !important;
        line-height: 1.2 !important;
    }
    .shell-user-block:hover {
        background: #F3F4F6 !important;
    }
    .shell-user-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #2D3142;
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .shell-user-text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        line-height: 1.25;
    }
    .shell-user-name {
        font-size: 14px;
        font-weight: 700;
        color: #2D3142;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .shell-user-role {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: #9CA3AF;
    }
    .shell-logout-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        color: #2D3142;
        background: #fff;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        line-height: 1 !important;
    }
    .shell-logout-btn:hover {
        background: #F3F4F6;
        border-color: #D1D5DB;
    }
    .shell-popover-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #2D3142;
        color: #fff;
        font-weight: 700;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .sidebar-brand {
        padding: 20px 18px 16px;
        border-bottom: 1px solid #F3F4F6;
        margin-bottom: 4px;
    }
    .sidebar-brand__title {
        font-family: 'Inter', sans-serif;
        font-size: 22px;
        font-weight: 800;
        color: #2D3142;
        letter-spacing: -0.03em;
        text-decoration: none !important;
        display: block;
        line-height: 1.2;
    }
    .sidebar-brand__title:hover {
        color: #000000;
    }
    .sidebar-brand__tagline {
        margin-top: 6px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #9CA3AF;
    }

    .ant-menu-item-group-title {
        padding: 14px 16px 6px !important;
        margin: 0 !important;
    }
    .sidebar-group-label {
        font-size: 10px !important;
        font-weight: 700 !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        color: #9CA3AF !important;
    }

    /* Mobile Actions */
    .mobile-action{
        position: absolute;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        @media only screen and (max-width: 767px){
            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
        }
        a{
            display: inline-flex;
            color: ${({ theme }) => theme['light-color']};
            &.btn-search{
                ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 18px;
            }
            svg{
                width: 20px
                height: 20px;
            }
        }
    }
    .admin-footer{
        @media print {
            display: none;
        }
        .admin-footer__copyright{
            display: inline-block;
            width: 100%;
            color: #9CA3AF;
            @media only screen and (max-width: 767px){
                text-align: center;
                margin-bottom: 10px;
            }
        }
        .admin-footer__links{
            text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
            @media only screen and (max-width: 767px){
                text-align: center;
            }
            a{
                color: #9CA3AF;
                &:not(:last-child){
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
                }
                &:hover{
                    color: #2D3142;
                }
            }
        }
    }    
`;

const SmallScreenAuthInfo = Styled.div`
        ${({ darkMode }) => (darkMode ? `background: #1F2937;` : 'background: #fff')};
        width: 100%;
        position: fixed;
        margin-top: ${({ hide }) => (hide ? '0px' : '64px')};
        top: 0;
        ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
        transition: .3s;
        opacity: ${({ hide }) => (hide ? 0 : 1)};
        z-index: ${({ hide }) => (hide ? -1 : 1)};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

`;

const SmallScreenSearch = Styled.div`
        ${({ darkMode }) => (darkMode ? `background: #1F2937` : 'background: #fff')};
        width: 100%;
        position: fixed;
        margin-top: ${({ hide }) => (hide ? '0px' : '64px')};
        top: 0;
        ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
        transition: .3s;
        opacity: ${({ hide }) => (hide ? 0 : 1)};
        z-index: ${({ hide }) => (hide ? -1 : 999)};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

`;

const ModeSwitch = Styled.div`
    background: #ddd;
    width: 200px;
    position: fixed;
    ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
    top: 50%;
    margin-top: -100px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    padding: 15px;
    border-radius: 5px;
    button{
        margin-top: 5px;
    }
`;

const TopMenuSearch = Styled.div`
    .top-right-wrap{
        position: relative;
        float: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
    }
    .search-toggle{
        display: flex;
        align-items: center;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
        color: #6B7280;
        .feather-x{
            display: none;
        }
        .feather-search{
            display: flex;
        }
        &.active{
            .feather-search{
                display: none;
            }
            .feather-x{
                display: flex;
            }
        }
        svg,
        img{
            width: 20px;
        }
    }
    .topMenu-search-form{
        position: absolute;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 100%;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
        top: 12px;
        background-color: #fff;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        height: 40px;
        width: 280px;
        display: none;
        &.show{
            display: block;
        }
        .search-icon{
            width: fit-content;
            line-height: 1;
            position: absolute;
            left: 15px;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 15px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 9999;
        }
        i,
        svg{
            width: 18px;
            color: #9CA3AF;
        }
        form{
            height: auto;
            display: flex;
            align-items: center;
        }
        input{
            position: relative;
            border-radius: 8px;
            width: 100%;
            border: 0 none;
            height: 38px;
            padding-left: 40px;
            z-index: 999;
            ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 40px;
            &:focus{
                border: 0 none;
                box-shadow: 0 0;
                outline: none;
            }
        }
    }
`;

const TopMenuStyle = Styled.div`
    .strikingDash-top-menu{
        ul{
            li{
                display: inline-block;
                position: relative;
                ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 14px;
                @media only screen and (max-width: 1024px){
                    ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 10px;
                }
                &:not(:last-child){
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 34px;
                    @media only screen and (max-width: 1300px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 30px;
                    }
                    @media only screen and (max-width: 1199px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 26px;
                    }
                    @media only screen and (max-width: 1024px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 16px;
                    }
                }
                &.has-subMenu{
                    >a{
                        position: relative;
                        &:before{
                            position: absolute;
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: -14px;
                            top: 50%;
                            transform: translateY(-50%);
                            font-family: "FontAwesome";
                            content: '\f107';
                            line-height: 1;
                            color: #9CA3AF;
                        }
                        &.active{
                            &:before{
                                color: #2D3142;
                            }
                        }
                    }
                }
                &.has-subMenu-left{
                    >a{
                        position: relative;
                        &:before{
                            position: absolute;
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 30px;
                            top: 50%;
                            transform: translateY(-50%);
                            font-family: "FontAwesome";
                            content: '\f105';
                            line-height: 1;
                            color: #9CA3AF;
                        }
                    }
                }
                &:hover{
                    >.subMenu{
                        top: 64px;
                        opacity: 1;
                        visibility: visible;
                    }
                }
                a{
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    color: #6B7280;
                    &.active{
                        color: #2D3142;
                    }
                    svg,
                    img,
                    i{
                        margin-right: 14px;
                        width: 16px;
                    }
                }
                >ul{
                    li{
                        display: block;
                        position: relative;
                        ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 0;
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0 !important;
                        a{
                            font-weight: 400;
                            padding: 0 30px;
                            line-height: 3;
                            color: #9CA3AF;
                            transition: .3s;
                            &:hover,
                            &.active{
                                color: #2D3142;
                                background-color: #F9FAFB;
                                ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 40px;
                            }
                        }
                        &:hover{
                            .subMenu{
                                top: 0;
                                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 250px;
                                @media only screen and (max-width: 1300px){
                                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 180px;
                                }
                            }
                        }
                    }
                }
            }
        }
        .subMenu{
            width: 250px;
            background: #fff;
            border-radius: 8px;
            position: absolute;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
            top: 80px;
            padding: 12px 0;
            visibility: hidden;
            opacity: 0;
            transition: 0.3s;
            z-index: 98;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            border: 1px solid #F3F4F6;
            @media only screen and (max-width: 1300px){
                width: 180px;
            }
            .subMenu{
                width: 250px;
                background: #fff;
                position: absolute;
                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 250px;
                top: 0px;
                padding: 12px 0;
                visibility: hidden;
                opacity: 0;
                transition: 0.3s;
                z-index: 98;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                border: 1px solid #F3F4F6;
                @media only screen and (max-width: 1300px){
                    width: 200px;
                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 180px;
                }
            }
        }
    }
    // Mega Menu
    .strikingDash-top-menu{
        >ul{
            >li{
                &:hover{
                    .megaMenu-wrapper{
                        opacity: 1;
                        visibility: visible;
                        z-index: 99;
                    }
                }
                &.mega-item{
                    position: static;
                }
                .sDash_menu-item-icon{
                    line-height: .6;
                }
                .megaMenu-wrapper{
                    display: flex;
                    position: absolute;
                    text-align: ${({ theme }) => (theme.rtl ? 'right' : 'left')}
                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
                    top: 100%;
                    overflow: hidden;
                    z-index: -1;
                    padding: 16px 0;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                    border-radius: 0 0 8px 8px;
                    opacity: 0;
                    visibility: hidden;
                    transition: .4s;
                    background-color: #fff;
                    border: 1px solid #F3F4F6;
                    &.megaMenu-small{
                        width: 590px;
                        >li{
                            flex: 0 0 33.3333%;
                        }
                        ul{
                            li{
                                >a{
                                    padding: 0 45px;
                                    position: relative
                                    &:after{
                                        width: 5px;
                                        height: 5px;
                                        border-radius: 50%;
                                        position: absolute;
                                        ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 30px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        background-color: #D1D5DB;
                                        content: '';
                                        transition: .3s;
                                    }
                                    &:hover,
                                    &.active{
                                        ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 45px;
                                        color: #2D3142;
                                        &:after{
                                            background-color: #2D3142;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    &.megaMenu-wide{
                        width: 1000px;
                        padding: 5px 0 18px;
                        @media only screen and (max-width: 1300px){
                            width: 800px;
                        }
                        >li{
                            position: relative;
                            flex: 0 0 25%;
                            .mega-title{
                                position: relative;
                                font-size: 14px;
                                font-weight: 500;
                                padding-left: 45px;
                                ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 45px;
                                color: #2D3142;
                                &:after{
                                    position: absolute;
                                    height: 5px;
                                    width: 5px;
                                    border-radius: 50%;
                                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 30px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    background-color: #D1D5DB;
                                    content: '';
                                }
                            }
                        }
                    }
                    ul{
                        li{
                            position: relative;
                            &:hover{
                                >a{
                                    padding-left: 45px;
                                }
                                &:after{
                                    opacity: 1;
                                    visibility: visible;
                                }
                            }
                            >a{
                                line-height: 3;
                                color: #9CA3AF;
                                font-weight: 400;
                                transition: .3s;
                            }
                            
                            &:after{
                                width: 6px;
                                height: 1px;
                                border-radius: 50%;
                                position: absolute;
                                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 30px;
                                top: 50%;
                                transform: translateY(-50%);
                                background-color: #9CA3AF;
                                content: '';
                                transition: .3s;
                                opacity: 0;
                                visibility: hidden;
                            }
                        }
                    }
                }
            }
        }
    }
`;

const NavTitle = Styled.p`
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    color: #9CA3AF;
    padding: 0px 15px;
    display: flex;
`;
export { Div, SmallScreenAuthInfo, SmallScreenSearch, ModeSwitch, TopMenuStyle, TopMenuSearch, NavTitle };
