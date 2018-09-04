
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
	   <?php echo lang('edit_user_heading');?></h1>
        <small><?php echo lang('edit_user_subheading');?></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title"></h3>
		<hr />	 
		<?php echo form_open(uri_string());?>

		  <div class="form-group">
				<label><?php echo lang('edit_user_fname_label', 'first_name');?> </label>
				<?php echo form_input($first_name);?>
		  </div>

		  <div class="form-group">
				<label><?php echo lang('edit_user_lname_label', 'last_name');?> </label>
				<?php echo form_input($last_name);?>
		  </div>

		  <div class="form-group">
				<label><?php echo lang('edit_user_company_label', 'company');?> </label>
				<?php echo form_input($company);?>
		  </div>

		  <div class="form-group">
				<label><?php echo lang('edit_user_phone_label', 'phone');?> </label>
				<?php echo form_input($phone);?>
		  </div>

		  <div class="form-group">				
				<label><?php echo sprintf(lang('edit_user_password_label', 'password'),$min_password_length);?></label>
				<?php echo form_input($password);?>
		  </div>

		  <div class="form-group">
				<label><?php echo lang('edit_user_password_confirm_label', 'password_confirm');?></label>
				<?php echo form_input($password_confirm);?>
		  </div>
		  <div class="checkbox">
		  <?php if ($this->ion_auth->is_admin()): ?>

			  <h3><?php echo lang('edit_user_groups_heading');?></h3>
			  <?php foreach ($groups as $group):?>				  
				  <label class="checkbox">
				  <?php
					  $gID=$group['id'];
					  $checked = null;
					  $item = null;
					  foreach($currentGroups as $grp) {
						  if ($gID == $grp->id) {
							  $checked= ' checked="checked"';
						  break;
						  }
					  }
				  ?>
				  <input type="checkbox" name="groups[]" value="<?php echo $group['id'];?>"<?php echo $checked;?>>
				  <?php echo htmlspecialchars($group['name'],ENT_QUOTES,'UTF-8');?>
				  </label>
			  <?php endforeach?>
			
		  <?php endif ?>
		  </div>
		  <?php echo form_hidden('id', $user->id);?>
		  <?php echo form_hidden($csrf); ?>

	    <?php echo form_submit('submit', lang('edit_user_submit_btn'), array('class'=>'btn btn-flat btn-primary'));?>
	    <a href="<?php echo site_url('auth/index') ?>" class="btn btn-flat btn-default">Batal</a>
	<?php echo form_close();?>
		</div>
		</div>
               
    </section>
	<!-- /.content -->
