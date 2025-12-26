/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Select, DatePicker, message, Card, Table } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';

import { AddEventWrap } from '../calendar/Style';
import { AutoComplete } from '../../components/autoComplete/autoComplete';
import { PageHeader } from '../../components/page-headers/page-headers';
import { ProjectHeader, ProjectSorting } from '../../config/default/style';
import { Main } from '../../config/default/styled';
import { fetchAllClassTypes } from '../../redux/classtypes/classtypeSlice';
import { createClassAttendance, fetchAllClassAttendances } from '../../redux/classattendances/classattendanceSlice';
import { fetchAllStudents } from '../../redux/students/studentSlice';
import ProjectLists from '../../config/default/List';

function ClassAttendances() {
  const dispatch = useDispatch();

  const { classattendances } = useSelector((state) => state.classattendances);
  const { selectedBranchId } = useSelector((state) => state.seletedBranch);
  const { classtypes } = useSelector((state) => state.classtypes);
  const { students, loading } = useSelector((state) => state.students);

  const [selectedClassType, setSelectedClassType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [dataSource, setDataSource] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchAllClassTypes(selectedBranchId));
    }
  }, [selectedBranchId]);

  useEffect(() => {
    if (showTable && students && Array.isArray(students)) {
      let filtered = students.filter((s) => s.classCode === selectedClassType);

      if (searchTerm) {
        filtered = filtered.filter(
          (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.toString().includes(searchTerm),
        );
      }

      const formatted = filtered.map((student) => ({
        key: student._id,
        id: student._id,
        rollNo: student.rollNo,
        name: student.name,
        fatherName: student.fatherName,
      }));

      setDataSource(formatted);

      const options = filtered.map((s) => ({ value: s.name }));
      setAutoCompleteOptions(options);
    }
  }, [students, showTable]);

  useEffect(() => {
    if (classattendances?.length) {
      const statusMap = {};
      classattendances.forEach((att) => {
        statusMap[att.student_id] = att.status;
      });
      setAttendanceStatus(statusMap);
    } else if (students && Array.isArray(students) && showTable) {
      setAttendanceStatus({});
    }
  }, [classattendances, students, selectedClassType]);

  const handleMarkAttendance = (studentId, status) => {
    if (!selectedClassType || !selectedDate) {
      message.error('Please select class and date first');
      return;
    }

    dispatch(
      createClassAttendance({
        student_id: studentId,
        classCode: selectedClassType,
        date: selectedDate.format('DD-MM-YYYY'),
        status: status,
        branch_id: selectedBranchId,
      }),
    );

    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));

    setDataSource((prev) => prev.map((item) => (item.id === studentId ? { ...item, status: status } : item)));

    toast.success(`Attendance marked as ${status}`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handlePageChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const handleSizeChange = (current, size) => {
    setPagination({
      ...pagination,
      current: 1,
      pageSize: size,
    });
  };

  const handleShowData = () => {
    if (selectedBranchId && selectedClassType && selectedDate) {
      setAttendanceStatus({});
      dispatch(fetchAllStudents(selectedBranchId));
      dispatch(
        fetchAllClassAttendances({
          branch_id: selectedBranchId,
          classCode: selectedClassType,
          date: selectedDate.format('DD-MM-YYYY'),
        }),
      );
      setShowTable(true);
    } else {
      message.error('Please select class and date first');
    }
  };

  const columns = [
    {
      title: '#',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 50,
    },
    {
      title: 'Roll No',
      dataIndex: 'rollNo',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Father Name',
      dataIndex: 'fatherName',
    },
    {
      title: 'Attendance',
      render: (text, record) => {
        const status = attendanceStatus[record.id];
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${status === 'present' ? 'btn-primary' : 'btn-outline-primary'}`}
              disabled={status === 'present'}
              onClick={() => handleMarkAttendance(record.id, 'present')}
            >
              Present
            </button>
            <button
              type="button"
              className={`btn btn-sm ${status === 'absent' ? 'btn-success' : 'btn-outline-success'}`}
              disabled={status === 'absent'}
              onClick={() => handleMarkAttendance(record.id, 'absent')}
            >
              Absent
            </button>

            <button
              type="button"
              className={`btn btn-sm ${status === 'onLeave' ? 'btn-danger' : 'btn-outline-danger'}`}
              disabled={status === 'onLeave'}
              onClick={() => handleMarkAttendance(record.id, 'onLeave')}
            >
              Leave
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <ProjectHeader>
        <PageHeader ghost title="Class Attendance" />
      </ProjectHeader>
      <Main>
        <Row gutter={25}>
          <Col xs={24}>
            <ProjectSorting>
              <div className="project-sort-bar">
                <div className="project-sort-search">
                  <AutoComplete onSearch={(value) => setSearchTerm(value)} placeholder="Search classLists" patterns />
                </div>
                <div className="sort-group resposive_attendance">
                  <Select
                    className="pl-0"
                    style={{ marginLeft: '0' }}
                    placeholder="Select Class"
                    onChange={(value) => setSelectedClassType(value)}
                  >
                    {classtypes?.map((classType) => (
                      <Select.Option key={classType.code} value={classType.code}>
                        {classType.name} ({classType.code})
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="resposive_date">
                  <AddEventWrap>
                    <div className="date-time-picker d-flex ">
                      <DatePicker value={selectedDate} onChange={(date) => setSelectedDate(date)} />
                    </div>
                  </AddEventWrap>
                </div>
                <div className="resposive_btn show_btn">
                  <button
                    type="button"
                    className="show_btn btn btn-primary"
                    onClick={handleShowData}
                    style={{ height: '38px' }}
                  >
                    Show Data
                  </button>
                </div>
              </div>
            </ProjectSorting>

            <div className="d-none d-md-block">
              <ProjectLists
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                total={students?.length || 0}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                onShowSizeChange={handleSizeChange}
              />
            </div>

            <div className="d-block d-md-none" style={{ paddingBottom: '10px' }}>
              {students?.map((student) => {
                const studentKey = student._id || student.id;
                const status = attendanceStatus[studentKey];

                return (
                  <Card key={studentKey} className="shadow-sm mb-2">
                    <div className="row align-items-center mb-2">
                      <div className="col-6 fs-9">
                        <strong>Roll No:</strong> {student.rollNo}
                      </div>
                      <div className="col-6 text-end">
                        <button
                          type="button"
                          className={`btn btn-sm  ${status === 'present' ? 'btn-primary' : 'btn-outline-primary'}`}
                          disabled={status === 'present'}
                          style={{ width: '70%' }}
                          onClick={() => handleMarkAttendance(studentKey, 'present')}
                        >
                          Present
                        </button>
                      </div>
                    </div>
                    <div className="row align-items-center mb-2">
                      <div className="col-6 fs-9">
                        <strong>Name:</strong> {student.name}
                      </div>
                      <div className="col-6 text-end">
                        <button
                          type="button"
                          className={`btn btn-sm  ${status === 'absent' ? 'btn-success' : 'btn-outline-success'}`}
                          disabled={status === 'absent'}
                          style={{ width: '70%' }}
                          onClick={() => handleMarkAttendance(studentKey, 'absent')}
                        >
                          Absent
                        </button>
                      </div>
                    </div>

                    <div className="row align-items-center">
                      <div className="col-6 fs-9">
                        <strong>Father Name:</strong> {student.fatherName}
                      </div>
                      <div className="col-6 text-end">
                        <button
                          type="button"
                          className={`btn btn-sm ${status === 'onLeave' ? 'btn-danger' : 'btn-outline-danger'}`}
                          disabled={status === 'onLeave'}
                          style={{ width: '70%' }}
                          onClick={() => handleMarkAttendance(studentKey, 'onLeave')}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ClassAttendances;
