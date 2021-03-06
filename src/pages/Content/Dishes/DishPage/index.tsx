import React from 'react';
import { ISEOStore } from '../../../../stores/SEOStore/interfaces';
import { inject, observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { IDishStore, IDish } from '../../../../stores/DishStore/interfaces';
import Card from '../../../../components/UI/Card';
import Form from '../../../../components/Forms';
import { IInput } from '../../../../components/Forms';
import { IInputDataStore } from '../../../../stores/InputDataStore/interfaces';
import Button from '../../../../components/UI/Button';
import { ITab } from '../../../../components/UI/Card/interfaces';

import './styles.sass';
import TabPane from '../../../../components/UI/Card/TabPane';
import IngredientsConstructor from '../../../../components/Forms/IngredientsConstructor';


interface Props {
	match: {
		params: {
			categoryID: string
			dishID: string
		}
	}
	seoStore: ISEOStore
	dishStore: IDishStore
	inputDataStore: IInputDataStore
}

const SEO = {
	title: 'Ingredient Page',
	icon: ''
}

@inject('seoStore', 'dishStore', 'inputDataStore')
@observer
class DishPage extends React.Component <Props> {
	@observable reset = false;
	@observable resetForm = false;
	@observable loading = true;

	@observable inputs = [] as IInput[];
	@observable tabs = [] as ITab[];

	@observable dish = {} as IDish;

	@action procesPageData = () => {

		if (Object.keys(this.dish).length > 0){
			this.inputs = [
				{
					inputType: 'text',
					inputID: `dish_${this.dish.id}_name`,
					inputName: 'name',
					inputValue: this.dish.name,
					title: 'Dish name'
				},
				{
					inputType: 'editor',
					inputID: `dish_${this.dish.id}_description`,
					inputName: 'description',
					inputValue: this.dish.description,
					title: 'Dish description'
				},
				{
					inputType: 'image',
					inputID: `dish_${this.dish.id}_image`,
					inputValue: this.dish.thumb,
					inputName: 'image',
					title: 'Image'
				},
				{
					inputType: 'ingredients',
					inputID: `dish_${this.dish.id}_ingredients`,
					inputValue: this.dish.ingredients,
					inputName: 'none',
					title: 'Ingredients'
				}
			];
			this.tabs = [
				{
					name: 'Edit',
					href: `#dish-${this.dish.id}-tab-edit`,
					tabsID: `dish_tabs_${this.dish.id}`
				},
				{
					name: 'Ingredients',
					href: `#dish-${this.dish.id}-tab-ingredients`,
					tabsID: `dish_tabs_${this.dish.id}`
				},
			];
		}
		
		this.setSEO();

		return;
	}

	@action setSEO(){
		 if (Object.keys(this.dish).length === 0){
			this.props.seoStore!.setSEOData(SEO);
			return;
		}
		const { icon, name } = this.dish; 

		this.props.seoStore.setSEOData({
			icon: icon ? <img src={icon} alt={name} /> : '',
			title: name
		});
	}

	@action setReset = () => {
		this.reset = true;
	}

	@action setResetForm = () => {

		this.resetForm = true;
		this.reset = false;
		setTimeout(() => {this.resetForm = false;}, 0);
	}

	@action saveForm = async () => {

		this.loading = true;

		for (let i = 0; i < this.inputs.length; i++){

			const input = this.inputs[i];

			if (this.dish.hasOwnProperty(input.inputName)) {
				const inputData = await this.props.inputDataStore.getInputDataStore(input.inputID);
				// @ts-ignore
				this.dish[input.inputName] = inputData.inputContent
			}
		}

		this.dish = await this.props.dishStore.saveDish(this.dish);

		this.props.seoStore.setSEOData({
			icon: this.dish.icon ? <img src={this.dish.icon} alt={this.dish.name} /> : '',
			title: this.dish.name
		});

		this.loading = false;
		this.reset = false;
	}

	async componentDidMount() {

		this.setSEO();

		const { dishID } = this.props.match.params
		
		this.dish = await this.props.dishStore.getDish(Number(dishID));
		this.procesPageData();

		this.loading = false;
	}

	async componentWillReceiveProps(nextProps: Props){

		const { dishID } = nextProps.match.params

		this.dish = await nextProps.dishStore.getDish(Number(dishID));
		this.procesPageData();

		this.loading = false;
	}

	render() {
		console.log(this.dish.ingredients)
		return <>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-9">
						<Card id={`dish_tabs_${this.props.match.params.dishID}`} tabs={this.tabs}>
							<TabPane id={`dish-${this.dish.id}-tab-edit`}>
								<Form inputs={this.inputs} loading={this.loading} onInputsChange={this.setReset} resetForm={this.resetForm} />
							</TabPane>
							<TabPane id={`dish-${this.dish.id}-tab-ingredients`} active={true}>
								<div className="row">
									<div className="col-md-7">
										<IngredientsConstructor inputID={`dish_${this.dish.id}_ingredients`} reset={this.resetForm} content={this.dish.ingredients} onChange={this.setReset} />
									</div>
									<div className="col-md-5"></div>
								</div>
							</TabPane>
						</Card>
					</div>
					<div className="col-md-3">
						<Card>
							{
								this.reset ? 
								<>
									<Button onClick={this.saveForm} className='btn-block btn-primary mb-2'>Save</Button>
									<Button onClick={this.setResetForm} className='btn-block btn-warning mb-10'>Reset</Button>
								</>
								: ''
							}
							<Button onClick={this.saveForm} className='btn-danger btn-block'>Delete</Button>
						</Card>
					</div>
				</div>
			</div>
			
		</>
	}
}

export default DishPage;