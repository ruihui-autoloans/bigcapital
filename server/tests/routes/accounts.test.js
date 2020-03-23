import { request, expect, create, login } from '~/testInit';
import Account from '@/models/Account';

let loginRes;

describe.only('routes: /accounts/', () => {
  beforeEach(async () => {
    loginRes = await login();
  });
  afterEach(() => {
    loginRes = null;
  });
  describe('POST `/accounts`', () => {
    it('Should `name` be required.', async () => {
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should `account_type_id` be required.', async () => {
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should max length of `code` be limited.', async () => {
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should response type not found in case `account_type_id` was not exist.', async () => {
      const account = await create('account');
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send({
          name: 'Account Name',
          description: account.description,
          account_type_id: 22, // not found.
          code: 123,
        });

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'NOT_EXIST_ACCOUNT_TYPE', code: 200,
      });
    });

    it('Should account code be unique in the storage.', async () => {
      const account = await create('account');
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send({
          name: account.name,
          description: account.description,
          account_type_id: account.accountTypeId,
          code: account.code,
        });

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'NOT_UNIQUE_CODE', code: 100,
      });
    });

    it('Should response success with correct data form.', async () => {
      const account = await create('account');
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send({
          name: 'Name',
          description: 'description here',
          code: 100,
          account_type_id: account.accountTypeId,
          parent_account_id: account.id,
        });

      expect(res.status).equals(200);
    });

    it('Should store account data in the storage.', async () => {
      const account = await create('account');
      await request().post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send({
          name: 'Account Name',
          description: 'desc here',
          account_type: account.account_type_id,
          parent_account_id: account.id,
        });

      const accountModel = await Account.query().where('name', 'Account Name');

      expect(accountModel.description).equals('desc here');
      expect(accountModel.account_type_id).equals(account.account_type_id);
      expect(accountModel.parent_account_id).equals(account.parent_account_id);
    });
  });

  describe('POST `/accounts/:id`', () => {
    it('Should `name` be required.', async () => {
      const account = await create('account');
      const res = await request()
        .post(`/api/accounts/${account.id}`)
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should `account_type_id` be required.', async () => {
      const account = await create('account');
      const res = await request()
        .post(`/api/accounts/${account.id}`)
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should max length of `code` be limited.', async () => {
      const account = await create('account');
      const res = await request()
        .post(`/api/accounts/${account.id}`)
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
      expect(res.body.code).equals('validation_error');
    });

    it('Should response type not found in case `account_type_id` was not exist.', async () => {
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(422);
    });

    it('Should account code be unique in the storage.', async () => {
      await create('account', { code: 'ABCD' });
      const account = await create('account');
      const res = await request()
        .post(`/api/accounts/${account.id}`)
        .set('x-access-token', loginRes.body.token)
        .send({
          name: 'name',
          code: 'ABCD',
          account_type_id: account.accountTypeId,
        });

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'NOT_UNIQUE_CODE', code: 100,
      });
    });

    it('Should response success with correct data form.', async () => {
      const account = await create('account');
      const res = await request()
        .post('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send({
          name: 'Name',
          description: 'description here',
          account_type_id: account.accountTypeId,
          parent_account_id: account.id,
          code: '123',
        });

      expect(res.status).equals(200);
    });
  });

  describe('GET: `/accounts`', () => {
 
    it('Should retrieve accounts resource not found.', async () => {
      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'ACCOUNTS_RESOURCE_NOT_FOUND', code: 200,
      });
    });

    it('Should retrieve chart of accounts', async () => {
      await create('resource', { name: 'accounts' });
      const account = await create('account');
      await create('account', { parent_account_id: account.id });

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(200);
      expect(res.body.accounts.length).equals(1);
    });

    it('Should retrieve accounts based on view roles conditionals of the custom view.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      
      const accountTypeField = await create('resource_field', {
        label_name: 'Account type',
        key: 'type',
        resource_id: resource.id,
        active: true,
        predefined: true,
      });

      const accountNameField = await create('resource_field', {
        label_name: 'Account Name',
        key: 'name',
        resource_id: resource.id,
        active: true,
        predefined: true,
      });
      const accountsView = await create('view', {
        name: 'Accounts View',
        resource_id: resource.id,
        roles_logic_expression: '1 && 2',
      });
      await create('view_role', {
        view_id: accountsView.id,
        index: 1,
        field_id: accountTypeField.id,
        value: '2',
        comparator: 'equals',
      });
      await create('view_role', {
        view_id: accountsView.id,
        index: 2,
        field_id: accountNameField.id,
        value: 'account',
        comparator: 'contain',
      });

      await create('account', { name: 'account-1' });
      await create('account', { name: 'account-2' });
      await create('account', { name: 'account-3', account_type_id: 2 });

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({ custom_view_id: accountsView.id })
        .send();

      expect(res.body.accounts.length).equals(2);
      expect(res.body.accounts[0].name).equals('account-2');
      expect(res.body.accounts[1].name).equals('account-3');
      expect(res.body.accounts[0].account_type_id).equals(2);
      expect(res.body.accounts[1].account_type_id).equals(2); 
    });

    it.only('Should retrieve accounts based on view roles conditionals with relation join column.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      
      const accountTypeField = await create('resource_field', {
        label_name: 'Account type',
        key: 'type',
        resource_id: resource.id,
        active: true,
        predefined: true,
      });
      const accountsView = await create('view', {
        name: 'Accounts View',
        resource_id: resource.id,
        roles_logic_expression: '1',
      });
      const accountsViewRole = await create('view_role', {
        view_id: accountsView.id,
        index: 1,
        field_id: accountTypeField.id,
        value: '2',
        comparator: 'equals',
      });

      await create('account');
      await create('account');
      await create('account');

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          custom_view_id: accountsView.id
        })
        .send();

      expect(res.body.accounts.length).equals(1);
      expect(res.body.accounts[0].account_type_id).equals(2);
    });

    it('Should retrieve accounts and child accounts in nested set graph.', async () => {
      const resource = await create('resource', { name: 'accounts' });

      const account1 = await create('account');
      const account2 = await create('account', { parent_account_id: account1.id });
      const account3 = await create('account', { parent_account_id: account2.id });

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({ display_type: 'tree' })
        .send();

      expect(res.status).equals(200);

      expect(res.body.accounts[0].id).equals(account1.id);
      expect(res.body.accounts[0].children[0].id).equals(account2.id);
      expect(res.body.accounts[0].children[0].children[0].id).equals(account3.id);
    });

    it('Should retrieve accounts and child accounts in flat display with dashed accounts name.', async () => {
      const resource = await create('resource', { name: 'accounts' });

      const account1 = await create('account');
      const account2 = await create('account', { parent_account_id: account1.id });
      const account3 = await create('account', { parent_account_id: account2.id });

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({ display_type: 'flat' })
        .send();

      expect(res.body.accounts[0].id).equals(account1.id);
      expect(res.body.accounts[0].name).equals(account1.name);

      expect(res.body.accounts[1].id).equals(account2.id);
      expect(res.body.accounts[1].name).equals(`${account1.name} ― ${account2.name}`);

      expect(res.body.accounts[2].id).equals(account3.id);
      expect(res.body.accounts[2].name).equals(`${account1.name} ― ${account2.name} ― ${account3.name}`);
    });

    it('Should retrieve bad request when `filter_roles.*.comparator` not associated to `field_key`.', () => {

    });

    it('Should retrieve bad request when `filter_roles.*.field_key` not found in accounts resource.', async () => {
      const resource = await create('resource', { name: 'accounts' });

      const account1 = await create('account', { name: 'ahmed' });
      const account2 = await create('account');
      const account3 = await create('account');

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          stringified_filter_roles: JSON.stringify([{
            condition: 'AND',
            field_key: 'name',
            comparator: 'equals',
            value: 'ahmed',
          }, { 
            condition: 'AND',
            field_key: 'name',
            comparator: 'equals',
            value: 'ahmed',
          }]),
        });

      expect(res.body.errors).include.something.that.deep.equals({
        type: 'ACCOUNTS.RESOURCE.HAS.NO.GIVEN.FIELDS', code: 500,
      });
    });

    it('Should retrieve bad request when `filter_roles.*.condition` is invalid.', async () => {

    });

    it('Should retrieve filtered accounts according to the given account type filter condition.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      const resourceField = await create('resource_field', {
        key: 'type',
        resource_id: resource.id,
      });

      const account1 = await create('account', { name: 'ahmed' });
      const account2 = await create('account');
      const account3 = await create('account');

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          stringified_filter_roles: JSON.stringify([{
            condition: 'AND',
            field_key: resourceField.key,
            comparator: 'equals',
            value: '1',
          }]),
        });

      expect(res.body.accounts.length).equals(1);
    });

    it('Shoud retrieve filtered accounts according to the given account description filter condition.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      const resourceField = await create('resource_field', {
        key: 'description',
        resource_id: resource.id,
      });

      const account1 = await create('account', { name: 'ahmed', description: 'here' });
      const account2 = await create('account');
      const account3 = await create('account');

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          stringified_filter_roles: JSON.stringify([{
            condition: 'AND',
            field_key: resourceField.key,
            comparator: 'contain',
            value: 'here',
          }]),
        });

      expect(res.body.accounts.length).equals(1);
      expect(res.body.accounts[0].description).equals('here');
    });

    it('Should retrieve filtered accounts based on given filter roles between OR conditions.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      const resourceField = await create('resource_field', {
        key: 'description',
        resource_id: resource.id,
      });

      const resourceCodeField = await create('resource_field', {
        key: 'code',
        resource_id: resource.id,
      });

      const account1 = await create('account', { name: 'ahmed', description: 'target' });
      const account2 = await create('account', { description: 'target' });
      const account3 = await create('account');

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          stringified_filter_roles: JSON.stringify([{
            condition: '&&',
            field_key: resourceField.key,
            comparator: 'contain',
            value: 'target',
          }, {
            condition: '||',
            field_key: resourceCodeField.key,
            comparator: 'equals',
            value: 'ahmed',
          }]),
        });

      expect(res.body.accounts.length).equals(2);
      expect(res.body.accounts[0].description).equals('target');
      expect(res.body.accounts[1].description).equals('target');
      expect(res.body.accounts[0].name).equals('ahmed');
    });

    it('Should retrieve filtered accounts from custom view and filter roles.', async () => {
      const resource = await create('resource', { name: 'accounts' });
      const accountTypeField = await create('resource_field', {
        key: 'type', resource_id: resource.id,
      });
      const accountDescriptionField = await create('resource_field', {
        key: 'description', resource_id: resource.id,
      });

      const account1 = await create('account', { name: 'ahmed-1' });
      const account2 = await create('account', { name: 'ahmed-2', account_type_id: 1, description: 'target' });
      const account3 = await create('account', { name: 'ahmed-3' });

      const accountsView = await create('view', {
        name: 'Accounts View',
        resource_id: resource.id,
        roles_logic_expression: '1',
      });
      const accountsViewRole = await create('view_role', {
        view_id: accountsView.id,
        field_id: accountTypeField.id,
        index: 1,
        value: '1',
        comparator: 'equals',
      });

      const res = await request()
        .get('/api/accounts')
        .set('x-access-token', loginRes.body.token)
        .query({
          custom_view_id: accountsView.id,
          stringified_filter_roles: JSON.stringify([{
            condition: 'AND',
            field_key: accountDescriptionField.key,
            comparator: 'contain',
            value: 'target',
          }]),
        });

      expect(res.body.accounts.length).equals(1);
      expect(res.body.accounts[0].name).equals('ahmed-2');
      expect(res.body.accounts[0].description).equals('target');
    });
  });

  describe('DELETE: `/accounts`', () => {
    it('Should response not found in case account was not exist.', async () => {
      const res = await request()
        .delete('/api/accounts/10')
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(404);
    });

    it('Should delete the give account from the storage.', async () => {
      const account = await create('account');
      await request()
        .delete(`/api/accounts/${account.id}`)
        .set('x-access-token', loginRes.body.token)
        .send();

      const foundAccounts = await Account.query().where('id', account.id);
      expect(foundAccounts).to.have.lengthOf(0);
    });

    it('Should not delete the given account in case account has associated transactions.', async () => {
      const accountTransaction = await create('account_transaction');

      const res = await request()
        .delete(`/api/accounts/${accountTransaction.accountId}`)
        .set('x-access-token', loginRes.body.token)
        .send();

      expect(res.status).equals(400);
      expect(res.body.errors).include.something.that.deep.equals({
        type: 'ACCOUNT.HAS.ASSOCIATED.TRANSACTIONS', code: 100,
      });
    });
  });
});
