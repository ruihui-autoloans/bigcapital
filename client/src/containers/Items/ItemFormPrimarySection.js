import React, { useEffect, useRef } from 'react';
import {
  FormGroup,
  InputGroup,
  RadioGroup,
  Classes,
  Radio,
  Position,
} from '@blueprintjs/core';
import { FormattedMessage as T } from 'react-intl';
import { ErrorMessage, FastField, useFormikContext } from 'formik';
import {
  CategoriesSelectList,
  Hint,
  Col,
  Row,
  FieldRequiredHint,
} from 'components';
import classNames from 'classnames';
import { CLASSES } from 'common/classes';

import { useItemFormContext } from './ItemFormProvider';
import { handleStringChange, inputIntent } from 'utils';

/**
 * Item form primary section.
 */
export default function ItemFormPrimarySection() {
  const { itemsCategories } = useItemFormContext();

  const nameFieldRef = useRef(null);

  // Formik context.
  const { values: { type } } = useFormikContext();

  useEffect(() => {
    // Auto focus item name field once component mount.
    if (nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, []);

  const itemTypeHintContent = (
    <>
      <div class="mb1">
        <strong>{'Service: '}</strong>
        {'Services that you provide to customers. '}
      </div>
      <div class="mb1">
        <strong>{'Inventory: '}</strong>
        {'Products you buy and/or sell and that you track quantities of.'}
      </div>
      <div class="mb1">
        <strong>{'Non-Inventory: '}</strong>
        {
          'Products you buy and/or sell but don’t need to (or can’t) track quantities of, for example, nuts and bolts used in an installation.'
        }
      </div>
    </>
  );

  return (
    <div className={classNames(CLASSES.PAGE_FORM_HEADER_PRIMARY)}>
      {/*----------- Item type ----------*/}
      <FastField name={'type'}>
        {({ form, field: { value }, meta: { touched, error } }) => (
          <FormGroup
            medium={true}
            label={<T id={'item_type'} />}
            labelInfo={
              <span>
                <FieldRequiredHint />
                <Hint
                  content={itemTypeHintContent}
                  position={Position.BOTTOM_LEFT}
                />
              </span>
            }
            className={'form-group--item-type'}
            intent={inputIntent({ error, touched })}
            helperText={<ErrorMessage name="item_type" />}
            inline={true}
          >
            <RadioGroup
              inline={true}
              onChange={handleStringChange((_value) => {
                form.setFieldValue('type', _value);
              })}
              selectedValue={value}
              disabled={type === 'inventory'}
            >
              <Radio label={<T id={'service'} />} value="service" />
              <Radio label={<T id={'non_inventory'} />} value="non-inventory" />
              <Radio label={<T id={'inventory'} />} value="inventory" />
            </RadioGroup>
          </FormGroup>
        )}
      </FastField>

      <Row>
        <Col xs={7}>
          {/*----------- Item name ----------*/}
          <FastField name={'name'}>
            {({ field, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'item_name'} />}
                labelInfo={<FieldRequiredHint />}
                className={'form-group--item-name'}
                intent={inputIntent({ error, touched })}
                helperText={<ErrorMessage name={'name'} />}
                inline={true}
              >
                <InputGroup
                  medium={true}
                  {...field}
                  inputRef={(ref) => (nameFieldRef.current = ref)}
                />
              </FormGroup>
            )}
          </FastField>

          {/*----------- SKU ----------*/}
          <FastField name={'code'}>
            {({ field, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'item_code'} />}
                className={'form-group--item_code'}
                intent={inputIntent({ error, touched })}
                helperText={<ErrorMessage name={'code'} />}
                inline={true}
              >
                <InputGroup medium={true} {...field} />
              </FormGroup>
            )}
          </FastField>

          {/*----------- Item category ----------*/}
          <FastField name={'category_id'}>
            {({ form, field: { value }, meta: { error, touched } }) => (
              <FormGroup
                label={<T id={'category'} />}
                inline={true}
                intent={inputIntent({ error, touched })}
                helperText={<ErrorMessage name="category_id" />}
                className={classNames('form-group--category', Classes.FILL)}
              >
                <CategoriesSelectList
                  categories={itemsCategories}
                  selecetedCategoryId={value}
                  onCategorySelected={(category) => {
                    form.setFieldValue('category_id', category.id);
                  }}
                />
              </FormGroup>
            )}
          </FastField>
        </Col>

        <Col xs={3}>
          {/* <Dragzone
            initialFiles={initialAttachmentFiles}
            onDrop={handleDropFiles}
            onDeleteFile={handleDeleteFile}
            hint={'Attachments: Maxiumum size: 20MB'}
            className={'mt2'}
          /> */}
        </Col>
      </Row>
    </div>
  );
}
