/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Select, DatePicker, message, Table } from "antd";
import { AddEventWrap } from "../calendar/Style";
import { AutoComplete } from "../../components/autoComplete/autoComplete";
import { PageHeader } from "../../components/page-headers/page-headers";
import { ProjectHeader, ProjectSorting } from "../../config/default/style";
import { Main } from "../../config/default/styled";
import { fetchAllClassTypes } from "../../redux/classtypes/classtypeSlice";
import { fetchClassAttendanceSummary } from "../../redux/classattendances/classattendanceSlice";
import { fetchAllStudents } from "../../redux/students/studentSlice";

const { MonthPicker } = DatePicker;

function AttendanceStudents() {
    const dispatch = useDispatch();
    const { summary, loading } = useSelector((state) => state.classattendances);
    const { selectedBranchId } = useSelector((state) => state.seletedBranch);
    const { students } = useSelector((state) => state.students);
    const { classtypes } = useSelector((state) => state.classtypes);

    const [filters, setFilters] = useState({
        classType: null,
        date: null,
        showTable: false,
    });

    const [monthDays, setMonthDays] = useState([]);

    useEffect(() => {
        if (selectedBranchId) {
            dispatch(fetchAllClassTypes(selectedBranchId));
            dispatch(fetchAllStudents(selectedBranchId));
        }
    }, [selectedBranchId, dispatch]);

    const generateMonthDays = (date) => {
        if (!date) return [];

        const year = date.year();
        const month = date.month() + 1;
        const daysInMonth = date.daysInMonth();

        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                date: `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`
            });
        }
        return days;
    };

    const handleShowData = () => {
        const { classType, date } = filters;
        if (selectedBranchId && classType && date) {
            dispatch(
                fetchClassAttendanceSummary({
                    classCode: classType,
                    month: date.format("MM-YYYY"),
                })
            );
            setMonthDays(generateMonthDays(date));
            setFilters((prev) => ({ ...prev, showTable: true }));
        } else {
            message.error("Please select class and date first");
        }
    };

    const getDayStatus = (student, dayDate) => {
        const dailyAttendance = student.dailyAttendance?.find(
            att => att.date === dayDate
        );
        return dailyAttendance?.status || '-';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present': return { text: 'P', color: '#52c41a' };
            case 'absent': return { text: 'A', color: '#f5222d' };
            case 'leave': return { text: 'L', color: '#faad14' };
            default: return { text: '-', color: '#f5f5f5ff' };
        }
    };

    const columns = [
        {
            title: "#",
            key: "index",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Student Name",
            dataIndex: "studentId",
            key: "studentId",
            render: (studentId) => {
                const student = students?.find((s) => s._id === studentId);
                console.log(student, 'studentId');
                return student ? student.name : "Unknown";
            },
        },
        {
            title: "Presents",
            dataIndex: "present",
            key: "present",
            width: 30,
            render: (text) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: "Absents",
            dataIndex: "absent",
            key: "absent",
            width: 30,
            render: (text) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: "Leaves",
            dataIndex: "leave",
            key: "leave",
            width: 30,
            render: (text) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{text}</span>,
        },
        ...monthDays.map(day => ({
            title: day.day,
            key: `day-${day.day}`,
            onCell: (record) => {
                const status = getDayStatus(record, day.date);
                const badge = getStatusBadge(status);
                return {
                    style: {
                        textAlign: 'center',
                        backgroundColor: badge.color,
                    }
                };
            },
            render: (record) => {
                const status = getDayStatus(record, day.date);
                const badge = getStatusBadge(status);
                return badge.text;
            }
        })),

    ];

    return (
        <>
            <ProjectHeader>
                <PageHeader
                    ghost
                    title="Students Attendance Report - Detailed View"
                    subTitle={
                        <>
                            {loading ? "Loading..." : `${summary.length} Students`}
                        </>
                    }
                />
            </ProjectHeader>
            <Main>
                <Row gutter={25}>
                    <Col xs={24}>
                        <ProjectSorting>
                            <div className="project-sort-bar">
                                <div className="project-sort-search">
                                    <AutoComplete
                                        onSearch={(value) => console.log(value)}
                                        placeholder="Search Student"
                                        patterns
                                    />
                                </div>
                                <div className="sort-group resposive_attendance">
                                    <Select
                                        className="pl-0"
                                        style={{ marginLeft: "0" }}
                                        placeholder="Select Class"
                                        onChange={(value) =>
                                            setFilters((prev) => ({ ...prev, classType: value }))
                                        }
                                    >
                                        {classtypes?.map((classType) => (
                                            <Select.Option
                                                key={classType.code}
                                                value={classType.code}
                                            >
                                                {classType.name} ({classType.code})
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="resposive_date">
                                    <AddEventWrap>
                                        <div className="date-time-picker d-flex ">
                                            <MonthPicker
                                                onChange={(date) =>
                                                    setFilters((prev) => ({ ...prev, date }))
                                                }
                                                placeholder="Select month"
                                            />
                                        </div>
                                    </AddEventWrap>
                                </div>

                                <div className="resposive_btn show_btn">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleShowData}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Show Report'}
                                    </button>
                                </div>
                            </div>
                        </ProjectSorting>
                    </Col>
                </Row>

                {filters.showTable && (
                    // <Card
                    //     title={`Attendance for ${filters.date?.format('MMMM YYYY')} - ${classtypes?.find(ct => ct.code === filters.classType)?.name}`}
                    // >
                    <div className="attendance-table-wrapper">
                        <Table
                            columns={columns}
                            dataSource={summary}
                            loading={loading}
                            bordered
                            pagination={false}
                            scroll={{ x: 1500 }}
                            rowKey="studentId"
                        />
                    </div>
                    // </Card>

                )}
            </Main>
        </>
    );
}

export default AttendanceStudents;