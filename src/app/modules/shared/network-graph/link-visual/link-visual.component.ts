import { Component, Input } from '@angular/core';
import { Link } from 'src/app/helpers/models/network-graph';

@Component({
  selector: '[linkVisual]',
  template: `
    <svg:line
        class="{{'link ' + getLinkClasses(link)}}"
        [attr.x1]="link?.source?.x"
        [attr.y1]="link?.source?.y"
        [attr.x2]="link?.target?.x"
        [attr.y2]="link?.target?.y"
    >
    <title>{{getLinkHoverInfo(link)}}</title>
    </svg:line>
  `,
  styleUrls: ['./link-visual.component.scss']
})
export class LinkVisualComponent  {
  @Input('linkVisual') link: Link | undefined;

  getLinkClasses(link: any) {
    return link?.source?.id + " " + link?.target?.id;
  }
  getLinkHoverInfo(link: any) {
    return link?.source?.name + ' → ' + link?.target?.name;
  }
}
