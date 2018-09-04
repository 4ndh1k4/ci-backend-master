
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1><?php echo lang('create_user_heading');?></h1>
		<small><?php echo lang('create_user_subheading');?></small>
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
		<?php echo form_open("auth/create_user");?>
		<div class="form-group">
            <label><?php echo lang('create_user_fname_label', 'first_name');?> </label>
            <?php echo form_input($first_name);?>
      </div>

      <div class="form-group">
            <label><?php echo lang('create_user_lname_label', 'last_name');?> </label>
            <?php echo form_input($last_name);?>
      </div>
      
      <?php
      if($identity_column!=='email') {
          echo '<div class="form-group">';
          echo '<label>';
          echo lang('create_user_identity_label', 'identity');
          echo '</label>';
          echo form_error('identity');
          echo form_input($identity);
          echo '</div>';
      }
      ?>

      <div class="form-group">
            <label><?php echo lang('create_user_company_label', 'company');?> </label>
            <?php echo form_input($company);?>
      </div>

      <div class="form-group">
            <label><?php echo lang('create_user_email_label', 'email');?> </label>
            <?php echo form_input($email);?>
      </div>

      <div class="form-group">
            <label><?php echo lang('create_user_phone_label', 'phone');?> </label>
            <?php echo form_input($phone);?>
      </div>

      <div class="form-group">
            <label><?php echo lang('create_user_password_label', 'password');?> </label>
            <?php echo form_input($password);?>
      </div>

      <div class="form-group">
            <label><?php echo lang('create_user_password_confirm_label', 'password_confirm');?> </label>
            <?php echo form_input($password_confirm);?>
      </div>

	    <?php echo form_submit('submit', lang('create_user_submit_btn'),array('class'=>'btn btn-flat btn-primary'));?>
	    <a href="<?php echo site_url('auth/index') ?>" class="btn btn-flat btn-default">Batal</a>
		<?php echo form_close();?>
		</div>
		</div>
               
    </section>
	<!-- /.content -->
    

