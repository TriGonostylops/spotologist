import {Component, EventEmitter, OnDestroy, OnInit, Output, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription, debounceTime, distinctUntilChanged, filter, switchMap, tap, catchError, of, from} from 'rxjs';
import {UsernameService} from '../../core/user/username.service';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error';

@Component({
  selector: 'app-username-prompt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './username-prompt.html',
  styleUrl: './username-prompt.scss'
})
export class UsernamePromptComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usernameService = inject(UsernameService);

  @Output() cancelled = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();

  form!: FormGroup<{ username: FormControl<string> }>;
  availability: Availability = 'idle';
  submitting = false;
  submitError = '';
  private sub?: Subscription;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_.]+$/)
      ]]
    });

    this.sub = this.usernameCtrl.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => {
        this.availability = this.usernameCtrl.valid && this.usernameCtrl.value ? 'checking' : 'idle';
      }),
      filter(() => this.usernameCtrl.valid && !!this.usernameCtrl.value),
      switchMap(value => from(this.usernameService.checkAvailability(value))),
      catchError(() => of(false))
    ).subscribe((available: boolean) => {
      this.availability = available ? 'available' : 'taken';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get usernameCtrl() { return this.form.controls.username; }

  async onSubmit() {
    if (this.form.invalid || this.availability !== 'available') return;
    this.submitting = true;
    this.submitError = '';
    try {
      await this.usernameService.setUsername(this.usernameCtrl.value);
      this.completed.emit();
    } catch (e: any) {
      if (e?.status === 409) {
        this.availability = 'taken';
        this.submitError = 'This username was just taken. Please try another one.';
      } else {
        this.availability = 'error';
        this.submitError = 'Could not save username right now. Please try again.';
      }
    } finally {
      this.submitting = false;
    }
  }

  onCancel() { this.cancelled.emit(); }
}
