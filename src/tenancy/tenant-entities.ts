import { Attendance } from '../attendance/entities/attendance.entity';
import { ClassGroup } from '../academic/entities/class-group.entity';
import { Course } from '../courses/entities/course.entity';
import { Document } from '../documents/entities/document.entity';
import { Grade } from '../grades/entities/grade.entity';
import { TeacherAssignment } from '../iam/entities/teacher-assignment.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';

export const tenantEntities = [
    User,
    Student,
    Course,
    Attendance,
    Grade,
    Document,
    Notification,
    ClassGroup,
    TeacherAssignment,
] as const;

