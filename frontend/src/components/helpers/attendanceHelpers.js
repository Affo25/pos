/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
// helpers/attendanceHelpers.js
import moment from "moment";

export const generateColumns = (daysInMonth) => {
    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => ({
        title: i + 1,
        dataIndex: `day${i + 1}`,
        key: `day${i + 1}`,
        align: "center",
        onCell: (record) => {
            const value = record[`day${i + 1}`];
            let className = "";
            if (value === "P") className = "present-cell";
            else if (value === "A") className = "absent-cell";
            else if (value === "L") className = "leave-cell";
            return { className };
        },
    }));

    const summaryColumns = [
        { title: "T-Present", dataIndex: "presentCount", key: "presentCount", align: "center" },
        { title: "T-Absent", dataIndex: "absentCount", key: "absentCount", align: "center" },
        { title: "T-Leaves", dataIndex: "leaveCount", key: "leaveCount", align: "center" },
    ];

    return [
        { title: "Student", dataIndex: "studentName", key: "studentName" },
        ...dayColumns,
        ...summaryColumns,
    ];
};

export const formatAttendanceData = (classattendances, selectedDate, students) => {
    if (!selectedDate) return [];

    const daysInMonth = selectedDate.daysInMonth();
    const grouped = {};

    if (!classattendances.length) {
        return students.map((s) => {
            const row = {
                key: s._id,
                student_id: s._id,
                studentName: s.name,
                presentCount: 0,
                absentCount: 0,
                leaveCount: 0,
            };
            for (let d = 1; d <= daysInMonth; d++) {
                row[`day${d}`] = "-";
            }
            return row;
        });
    }

    classattendances.forEach((att) => {
        const day = moment(att.date, "DD-MM-YYYY").date();

        if (!grouped[att.student_id]) {
            const student = students.find((s) => s._id === att.student_id);
            grouped[att.student_id] = {
                key: att.student_id,
                student_id: att.student_id,
                studentName: student ? student.name : "Unknown",
                presentCount: 0,
                absentCount: 0,
                leaveCount: 0,
            };
        }

        grouped[att.student_id][`day${day}`] =
            att.status === "present" ? "P" : att.status === "absent" ? "A" : "L";

        if (att.status === "present") grouped[att.student_id].presentCount++;
        if (att.status === "absent") grouped[att.student_id].absentCount++;
        if (att.status === "onLeave") grouped[att.student_id].leaveCount++;
    });

    Object.values(grouped).forEach((row) => {
        for (let d = 1; d <= daysInMonth; d++) {
            if (!row[`day${d}`]) row[`day${d}`] = "-";
        }
    });

    return Object.values(grouped);
};

