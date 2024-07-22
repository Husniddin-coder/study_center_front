import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { RouterOutlet } from '@angular/router';
import { StudentService } from './services/student.serivce';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StudentService]
})
export class StudentComponent {
  constructor(
  ) { }
}
