import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import SelectableTableModal from '../../config/default/SelectableTableModal';
import { fetchAllSubjects } from '../../redux/subjects/subjectsSlice';

function SubjectTab({ form }) {
    const dispatch = useDispatch();
    const { selectedBranchId } = useSelector((state) => state.seletedBranch);
    const { subjects } = useSelector((state) => state.subjects);

    useEffect(() => {
        if (selectedBranchId) {
            dispatch(fetchAllSubjects(selectedBranchId));
        }
    }, [dispatch, selectedBranchId]);

    const subjectColumns = [
        { title: 'Code', dataIndex: 'code' },
        { title: 'Name', dataIndex: 'name' },
    ];

    return (
        <SelectableTableModal
            title="Subjects"
            data={subjects}
            columns={subjectColumns}
            searchKey="name"
            addButtonText="Add Subjects"
            value={form.getFieldValue('subjectId')}
            onChange={(ids) => form.setFieldsValue({ subjectId: ids })}
        />
    );
}

SubjectTab.propTypes = {
    form: PropTypes.object.isRequired,
};

export default SubjectTab;
