the staff health check isnt working still

main interface for session (presave fnc) of the tb grid

Refactor the dbs esepcially the PK's of all tables (student: matric_no; Staff: staff_id to actualy real world possible uniques values instead )

Student acces

Staff accesss

Now for an heirachial accces (users table??) (how the db table should be )
Also do we propose a dual accoumt for reps, i.e a staff account then the rep account as well which will be tied to a staff

Now the users table for accecs just needs to be tied to a staff id thats all, and the role will detremine how the authentication works

1. When the role is colllge_rep **CR** has acces to only **tables linked to the college id** ie is within the juridistiction of the college (dept, courses, staff(0f the collge), students, )
2. **DR** within the jurdscrtion of the department handling staffs, student, courses
3. **Staff**

**Critical**

1. Who has access to Program table?
2. how should the mapping be?
   1. COllge --> Dept --> Programm --> (so we look through the lower level then check for where it belongs accros the higher level) eg. trying to get the collge of an entity we check trough program table, and see the linked dept, the we check the dept table to see the link a collgee
   2. Or every record will have the three coulumns there? Factor in use cases,performing crud acces, while brainstroming

**Future scope**

1. A Centralise hub system having global scope then also having university scope

University Admin has superoir acess and universal scope

how do we propose handling control

**Considerations:** will need to expand the;

- Examination Category, e.g., Regular, TopUp, Part-Time, Online. (default = Regular)
- Campus Type (Single or Multi) default = single
- Examination Level to Schedule: All or selected Levels (default = All)
- No of Weeks for Exam Duration (e.g., 1, 3). (default = 2) calculated from the start-end date and floored up (eg, 23days equals 4 weeks: 3wks and 2days)
- The venues tab or access is for college rep upwards access also timetable genertion can only be done by the AD so it means the Operations Hub doesnt show in the rest levels

# **Timetable grid period selctor (i.e Calendar Projection Surface)**

- Show the full week durations/period mapping (period is saved from 0 on the backend, can show 1 in the front up until the end week)
- NOte we storing the execlusive period so thats what we ticking/selcting as no period slots
- Trying to make the ui, have like a mental/conceptual model mapaping so instead of plain mon,tues , shows the date (etc wed 24th while having the number of slot etc), the timetable slot should adjust with the number of days of the week as well (starting with monday)
- Ps: its the same idea but just shows the full view list of all the period slot of the exams days/weeks
- then we brainstorm on how to perisist it to the db

- # the constarints period seclector should be like the exclusion period selector as well but a smaller version (date picker look or ux ) and how do you handle grid with large weeks display (pagination like the date picker) BRAINSTORM DON'T TAKE MY BIAS, also fully understanding the conceptual and menta logic (cause for a venue inclusive exam shouldnt show period selector like that etc) also maps the mental and conceptual logic

so for example trying to set a course to fall in a period (i.e Exams that must be scheduled in specific time periods) the db hold the raw period integer but on the ui, period selctor the same menatl model (Temporal Matrix but can be in a date picker size i.e tuesday period 2 instead of raw integer periodsand aids for non technical or non domain experts)

# the period selctor and period reated pull, is picking from the latest in the db, not the curent active selction from the user and name or default description name if missing  
the related list for the System Readiness Checklist shouldnt auto fill form the history 


## i. getting mental, conceptual and business model rigt to get corr bw;

1. examtab
2. general_settings
3. optimization_settings
4. output_tab

## Utitlies:

A manual student registration (i.e create right in respect to registration) **other reps**, update only right

## ii. working on the crud interface, corr with db & mental mapping

## Consider:

- The dashboard should be able to show the actual user name from the staff table
- maually upload registration course, or student and courses

Priod selctor ensure the mesntal works, Exams After Exams no need for period etxc

