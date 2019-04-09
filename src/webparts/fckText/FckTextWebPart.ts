/**
* @file
* FckText Web Part for SharePoint Framework SPFx
*
* Author: Olivier Carpentier
* Copyright (c) 2016
*/
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  IWebPartContext,
  PropertyPaneToggle
} from '@microsoft/sp-webpart-base';
import { DisplayMode, Version } from '@microsoft/sp-core-library';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import * as strings from 'fckTextStrings';
import { IFckTextWebPartProps } from './IFckTextWebPartProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
export default class FckTextWebPart extends BaseClientSideWebPart<IFckTextWebPartProps> {
  private guid: string;
  /**
  * @function
  * Web part contructor.
  */
  public constructor(context?: IWebPartContext) {
    super();
    this.guid = this.getGuid();
    //Hack: to invoke correctly the onPropertyChange function outside this class
    //we need to bind this object on it first
    this.onPropertyPaneFieldChanged = this.onPropertyPaneFieldChanged.bind(this);
  }
  /**
  * @function
  * Gets WP data version
  */
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  /**
  * @function
  * Renders HTML code
  */
  public render(): void {
    if (Environment.type === EnvironmentType.ClassicSharePoint) {
      var errorHtml = '';
      errorHtml += '<div style="color: red;">';
      errorHtml += '<div style="display:inline-block; vertical-align: middle;"><i class="ms-Icon ms-Icon--Error" style="font-size: 20px"></i></div>';
      errorHtml += '<div style="display:inline-block; vertical-align: middle;margin-left:7px;"><span>';
      errorHtml += strings.ErrorClassicSharePoint;
      errorHtml += '</span></div>';
      errorHtml += '</div>';
      this.domElement.innerHTML = errorHtml;
      return;
    }

    if (this.displayMode == DisplayMode.Edit) {
      //Edit mode
      var html = '';
      html += "<textarea name='" + this.guid + "-editor' id='" + this.guid + "-editor'>" + this.properties.text + "</textarea>";
      this.domElement.innerHTML = html;

      var sheet = document.createElement('style');
      sheet.innerHTML = "cke_top {display:block!important;}";
      document.body.appendChild(sheet);

      var CKEDITORspfxFORTY_BASEPATH = '/sites/SMUDiNet/SiteAssets/apps/ckeditorspfxforty/';

      var ckEditorspfxfortyCdn: string = '//smud.sharepoint.com/sites/SMUDiNet/SiteAssets/apps/ckeditorspfxforty/CKEDITORspfxFORTY.js';
      SPComponentLoader.loadScript(ckEditorspfxfortyCdn, { globalExportsName: 'CKEDITORspfxFORTY' }).then((CKEDITORspfxFORTY: any): void => {
        //CKEDITORspfxFORTY.basePath = 'https://smud.sharepoint.com/sites/SMUDiNet/SiteAssets/apps/ckeditorspfxforty/';
        if (this.properties.inline == null || this.properties.inline === false)
          CKEDITORspfxFORTY.replace(this.guid + '-editor', {
            skin: 'moono-lisa,//smud.sharepoint.com/sites/SMUDiNet/SiteAssets/apps/ckeditorspfxforty/skins/moono-lisa/'
          });
        else
          CKEDITORspfxFORTY.inline(this.guid + '-editor', {
            skin: 'moono-lisa,//smud.sharepoint.com/sites/SMUDiNet/SiteAssets/apps/ckeditorspfxforty/skins/moono-lisa/'
          });
        for (var i in CKEDITORspfxFORTY.instances) {
          CKEDITORspfxFORTY.instances[i].on('change', (elm?, val?) => {
            //CKEDITORspfxFORTY.instances[i].updateElement();
            elm.sender.updateElement();
            var value = ((document.getElementById(this.guid + '-editor')) as any).value;
            if (this.onPropertyPaneFieldChanged && value != null) {
              this.properties.text = value;
            }
          });
          CKEDITORspfxFORTY.instances[i].on('instanceReady', function () {
            //console.log("instance ready ");
            let ckElements = document.getElementsByClassName("cke_top") as HTMLCollectionOf<HTMLElement>;
            ckElements[0].style.display = "block";
          });
        }
      });
    }
    else {
      //Read Mode
      this.domElement.innerHTML = this.properties.text;
    }
  }
  /**
  * @function
  * Generates a GUID
  */
  private getGuid(): string {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
  }
  /**
  * @function
  * Generates a GUID part
  */
  private s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  /**
  * @function
  * PropertyPanel settings definition
  */
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          displayGroupsAsAccordion: false,
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle('inline', {
                  label: strings.Inline,
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
