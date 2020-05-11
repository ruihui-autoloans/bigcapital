import React, { useCallback, useMemo } from 'react';
import DashboardActionsBar from 'components/Dashboard/DashboardActionsBar';
import { compose } from 'utils';
import {
  NavbarGroup,
  Button,
  Classes,
  Intent,
  Popover,
  Position,
  PopoverInteractionKind,
} from '@blueprintjs/core';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { If } from 'components';

import Icon from 'components/Icon';
import DialogConnect from 'connectors/Dialog.connector';
import FilterDropdown from 'components/FilterDropdown';

import withResourceDetail from 'containers/Resources/withResourceDetails';
import withDashboard from 'containers/Dashboard/withDashboard';

import { FormattedMessage as T, useIntl } from 'react-intl';

const ItemsCategoryActionsBar = ({
  // #withResourceDetail
  resourceName = 'item_category',
  resourceFields,
  
  // #withDialog
  openDialog,

  // #ownProps
  onDeleteCategory,
  onFilterChanged,
  selectedRows,
}) => {
  const onClickNewCategory = useCallback(() => {
    openDialog('item-category-form', {});
  }, [openDialog]);

  const handleDeleteCategory = useCallback((category) => {
    onDeleteCategory(selectedRows);
  }, [selectedRows, onDeleteCategory]);

  const hasSelectedRows = useMemo(() => selectedRows.length > 0, [selectedRows]);

  const filterDropdown = FilterDropdown({
    fields: resourceFields,
    onFilterChange: (filterConditions) => {
      onFilterChanged && onFilterChanged(filterConditions);
    },
  });
  return (
    <DashboardActionsBar>
      <NavbarGroup>
        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon='plus' />}
          text={<T id={'new_category'}/>}
          onClick={onClickNewCategory}
        />
        <Popover
          minimal={true}
          content={filterDropdown}
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.BOTTOM_LEFT}
        >
          <Button
            className={classNames(Classes.MINIMAL, 'button--filter')}
            text={<T id={'filter'}/>}
            icon={<Icon icon='filter' />}
          />
        </Popover>

        <If condition={hasSelectedRows}>
          <Button
            className={Classes.MINIMAL}
            icon={<Icon icon='trash' iconSize={15} />}
            text={<T id={'delete'}/>}
            intent={Intent.DANGER}
            onClick={handleDeleteCategory}
          />
        </If>

        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon='file-import' />}
          text={<T id={'import'}/>}
        />
        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon='file-export' />}
          text={<T id={'export'}/>}
        />
      </NavbarGroup>
    </DashboardActionsBar>
  );
};

const mapStateToProps = (state, props) => ({
  resourceName: 'items_categories',
});

const withItemsCategoriesActionsBar = connect(mapStateToProps);

export default compose(
  withItemsCategoriesActionsBar,
  DialogConnect,
  withDashboard,
  withResourceDetail(({ resourceFields }) => ({
    resourceFields,
  })) 
)(ItemsCategoryActionsBar);
